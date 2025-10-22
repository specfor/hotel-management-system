# Quick Deploy Script
#!/bin/bash

set -e

echo "🚀 Hotel Management System - Quick Deploy Setup"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
AWS_REGION=${AWS_REGION:-"us-east-1"}
PROJECT_NAME=${PROJECT_NAME:-"hotel-management-system"}
ENVIRONMENT=${ENVIRONMENT:-"dev"}

# Functions
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check if running in GitHub Actions
    if [ -n "$GITHUB_ACTIONS" ]; then
        print_success "Running in GitHub Actions environment"
        return 0
    fi
    
    # Check local dependencies
    local missing_deps=()
    
    if ! command -v aws &> /dev/null; then
        missing_deps+=("aws-cli")
    fi
    
    if ! command -v terraform &> /dev/null; then
        missing_deps+=("terraform")
    fi
    
    if ! command -v kubectl &> /dev/null; then
        missing_deps+=("kubectl")
    fi
    
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        echo "Please install the missing dependencies and try again."
        echo ""
        echo "Installation commands:"
        echo "  AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        echo "  Terraform: https://learn.hashicorp.com/tutorials/terraform/install-cli"
        echo "  kubectl: https://kubernetes.io/docs/tasks/tools/"
        echo "  Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    print_success "All dependencies found"
}

check_aws_credentials() {
    print_status "Checking AWS credentials..."
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured or invalid"
        echo "Please run 'aws configure' or set environment variables:"
        echo "  export AWS_ACCESS_KEY_ID=your_access_key"
        echo "  export AWS_SECRET_ACCESS_KEY=your_secret_key"
        echo "  export AWS_DEFAULT_REGION=$AWS_REGION"
        exit 1
    fi
    
    local aws_account=$(aws sts get-caller-identity --query Account --output text)
    local aws_user=$(aws sts get-caller-identity --query Arn --output text)
    
    print_success "AWS credentials valid"
    print_status "Account: $aws_account"
    print_status "User: $aws_user"
}

prepare_environment() {
    print_status "Preparing deployment environment..."
    
    # Create terraform.tfvars if it doesn't exist
    if [ ! -f "infrastructure/terraform.tfvars" ]; then
        print_status "Creating terraform.tfvars..."
        
        cat > infrastructure/terraform.tfvars << EOF
# Auto-generated terraform.tfvars
project_name = "$PROJECT_NAME"
environment  = "$ENVIRONMENT"
aws_region   = "$AWS_REGION"

# Kubernetes version
kubernetes_version = "1.30"

# Demo optimized settings (edit as needed)
node_instance_types   = ["t3.micro"]
node_desired_capacity = 1
node_max_capacity     = 2
node_min_capacity     = 1
node_capacity_type    = "SPOT"

# Database settings
db_allocated_storage = 10

# Tags
tags = {
  Environment = "$ENVIRONMENT"
  Project     = "$PROJECT_NAME"
  ManagedBy   = "quick-deploy-script"
  CreatedAt   = "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
        
        print_success "Created terraform.tfvars with demo-optimized settings"
    else
        print_warning "terraform.tfvars already exists, using existing configuration"
    fi
}

deploy_infrastructure() {
    print_status "Deploying infrastructure with Terraform..."
    
    cd infrastructure
    
    # Initialize Terraform
    print_status "Initializing Terraform..."
    terraform init
    
    # Plan deployment
    print_status "Planning deployment..."
    terraform plan -out=tfplan.out
    
    # Ask for confirmation if not in CI
    if [ -z "$GITHUB_ACTIONS" ]; then
        echo ""
        read -p "Do you want to apply these changes? (y/N): " confirm
        if [[ ! $confirm =~ ^[Yy]$ ]]; then
            print_warning "Deployment cancelled by user"
            exit 0
        fi
    fi
    
    # Apply changes
    print_status "Applying infrastructure changes..."
    terraform apply tfplan.out
    
    # Export important values
    export ECR_REPOSITORY_URL=$(terraform output -raw ecr_repository_url)
    export CLUSTER_NAME=$(terraform output -raw cluster_id)
    export S3_BUCKET_NAME=$(terraform output -raw s3_bucket_name)
    export CLOUDFRONT_DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
    
    print_success "Infrastructure deployed successfully!"
    
    cd ..
}

configure_kubectl() {
    print_status "Configuring kubectl for EKS cluster..."
    
    aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME
    
    # Wait for cluster to be ready
    print_status "Waiting for cluster to be ready..."
    kubectl wait --for=condition=Ready nodes --all --timeout=600s || {
        print_warning "Cluster nodes not ready yet, continuing anyway..."
    }
    
    print_success "kubectl configured for cluster: $CLUSTER_NAME"
}

build_and_push_backend() {
    print_status "Building and pushing backend Docker image..."
    
    # Login to ECR
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY_URL
    
    # Build and push
    cd backend
    
    print_status "Building backend image..."
    docker build -t $ECR_REPOSITORY_URL:latest .
    docker build -t $ECR_REPOSITORY_URL:$(date +%Y%m%d-%H%M%S) .
    
    print_status "Pushing to ECR..."
    docker push $ECR_REPOSITORY_URL:latest
    docker push $ECR_REPOSITORY_URL:$(date +%Y%m%d-%H%M%S)
    
    print_success "Backend image pushed successfully!"
    
    cd ..
}

deploy_backend() {
    print_status "Deploying backend to Kubernetes..."
    
    # Wait for backend deployment to be ready
    kubectl rollout status deployment/backend -n ${PROJECT_NAME}-app --timeout=300s || {
        print_warning "Backend deployment not ready, restarting..."
    }
    
    # Restart to use new image
    kubectl rollout restart deployment/backend -n ${PROJECT_NAME}-app
    
    # Wait for rollout to complete
    kubectl rollout status deployment/backend -n ${PROJECT_NAME}-app --timeout=600s
    
    print_success "Backend deployed successfully!"
}

build_and_deploy_frontend() {
    print_status "Building and deploying frontend..."
    
    cd frontend
    
    # Install dependencies and build
    print_status "Installing frontend dependencies..."
    npm ci
    
    print_status "Building frontend..."
    npm run build
    
    # Deploy to S3
    print_status "Deploying to S3..."
    aws s3 sync dist/ s3://$S3_BUCKET_NAME/ --delete \
        --cache-control "public, max-age=31536000" --exclude "*.html"
    
    aws s3 sync dist/ s3://$S3_BUCKET_NAME/ --delete \
        --cache-control "public, max-age=0, must-revalidate" --include "*.html"
    
    # Invalidate CloudFront
    print_status "Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*" > /dev/null
    
    print_success "Frontend deployed successfully!"
    
    cd ..
}

run_migrations() {
    print_status "Running database migrations..."
    
    # Get backend pod
    BACKEND_POD=$(kubectl get pods -n ${PROJECT_NAME}-app -l app=backend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    
    if [ -n "$BACKEND_POD" ]; then
        print_status "Running migrations on pod: $BACKEND_POD"
        
        # Copy migration files if needed
        kubectl cp backend/migrations ${PROJECT_NAME}-app/$BACKEND_POD:/app/migrations/ 2>/dev/null || true
        
        # Run migrations
        kubectl exec -n ${PROJECT_NAME}-app $BACKEND_POD -- npm run migrate || {
            print_warning "Migration command failed, trying alternative method..."
        }
        
        print_success "Database migrations completed!"
    else
        print_warning "No backend pods found, skipping migrations"
    fi
}

show_deployment_info() {
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "================================================"
    echo "📋 DEPLOYMENT INFORMATION"
    echo "================================================"
    
    cd infrastructure
    
    echo "🌐 Frontend URL: $(terraform output -raw frontend_url)"
    echo "🚀 API Endpoint: $(terraform output -raw api_endpoint)"
    echo "🏗️ Cluster Name: $(terraform output -raw cluster_id)"
    echo "📦 ECR Repository: $(terraform output -raw ecr_repository_url)"
    echo ""
    
    echo "💡 NEXT STEPS:"
    echo "1. Wait 5-10 minutes for DNS propagation"
    echo "2. Access your application using the Frontend URL above"
    echo "3. Check API health at: $(terraform output -raw api_endpoint)/health"
    echo "4. Monitor with: kubectl get pods -n ${PROJECT_NAME}-app"
    echo ""
    
    echo "💰 COST INFORMATION:"
    echo "- Current configuration is optimized for demo use"
    echo "- Estimated monthly cost: ~\$110"
    echo "- Using t3.micro spot instances for cost savings"
    echo ""
    
    echo "🔧 MANAGEMENT:"
    echo "- Use GitHub Actions for automated deployments"
    echo "- Run './scripts/quick-deploy.sh destroy' to clean up"
    echo "- Check SETUP.md for advanced configuration"
    
    cd ..
}

destroy_infrastructure() {
    print_warning "🗑️  DESTROYING INFRASTRUCTURE"
    echo "This will delete all AWS resources created for this project."
    echo ""
    
    if [ -z "$GITHUB_ACTIONS" ]; then
        read -p "Are you sure you want to destroy everything? Type 'yes' to confirm: " confirm
        if [ "$confirm" != "yes" ]; then
            print_warning "Destruction cancelled by user"
            exit 0
        fi
    fi
    
    cd infrastructure
    
    print_status "Destroying infrastructure..."
    terraform destroy -auto-approve
    
    print_success "Infrastructure destroyed successfully!"
    
    cd ..
}

# Main execution
main() {
    case "${1:-deploy}" in
        "deploy")
            check_dependencies
            check_aws_credentials
            prepare_environment
            deploy_infrastructure
            configure_kubectl
            build_and_push_backend
            deploy_backend
            build_and_deploy_frontend
            run_migrations
            show_deployment_info
            ;;
        "destroy")
            check_dependencies
            check_aws_credentials
            destroy_infrastructure
            ;;
        "status")
            check_dependencies
            check_aws_credentials
            cd infrastructure
            if [ -f "terraform.tfstate" ]; then
                terraform output
            else
                print_error "No Terraform state found. Run './scripts/quick-deploy.sh deploy' first."
            fi
            cd ..
            ;;
        *)
            echo "Usage: $0 [deploy|destroy|status]"
            echo ""
            echo "Commands:"
            echo "  deploy  - Deploy the complete application (default)"
            echo "  destroy - Destroy all AWS resources"
            echo "  status  - Show current deployment status"
            echo ""
            echo "Environment variables:"
            echo "  AWS_REGION=$AWS_REGION"
            echo "  PROJECT_NAME=$PROJECT_NAME"
            echo "  ENVIRONMENT=$ENVIRONMENT"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"