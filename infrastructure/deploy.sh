#!/bin/bash

# deploy.sh - Main deployment script for Hotel Management System

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
PROJECT_NAME="hotel-management-system"
ENVIRONMENT="${ENVIRONMENT:-dev}"

print_step() {
    echo -e "${BLUE}==== $1 ====${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if required tools are installed
check_prerequisites() {
    print_step "Checking Prerequisites"
    
    local tools=("terraform" "aws" "docker" "kubectl" "node" "npm")
    local missing_tools=()
    
    for tool in "${tools[@]}"; do
        if ! command -v $tool &> /dev/null; then
            missing_tools+=($tool)
        fi
    done
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_error "Please install the missing tools and run the script again"
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Initialize Terraform
init_terraform() {
    print_step "Initializing Terraform"
    
    cd infrastructure
    terraform init
    
    print_success "Terraform initialized"
    cd ..
}

# Plan Terraform deployment
plan_terraform() {
    print_step "Planning Terraform Deployment"
    
    cd infrastructure
    terraform plan \
        -var="project_name=${PROJECT_NAME}" \
        -var="environment=${ENVIRONMENT}" \
        -var="aws_region=${AWS_REGION}" \
        -out=tfplan
    
    print_success "Terraform plan created"
    cd ..
}

# Apply Terraform configuration
apply_terraform() {
    print_step "Applying Terraform Configuration"
    
    cd infrastructure
    terraform apply tfplan
    
    # Get outputs
    ECR_REPOSITORY_URL=$(terraform output -raw ecr_repository_url)
    CLUSTER_NAME=$(terraform output -raw cluster_id)
    S3_BUCKET_NAME=$(terraform output -raw s3_bucket_name)
    CLOUDFRONT_DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
    
    # Export for use in other functions
    export ECR_REPOSITORY_URL
    export CLUSTER_NAME
    export S3_BUCKET_NAME
    export CLOUDFRONT_DISTRIBUTION_ID
    
    print_success "Infrastructure deployed successfully"
    cd ..
}

# Configure kubectl
configure_kubectl() {
    print_step "Configuring kubectl"
    
    aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}
    
    print_success "kubectl configured"
}

# Build and push backend Docker image
build_and_push_backend() {
    print_step "Building and Pushing Backend Docker Image"
    
    # Login to ECR
    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPOSITORY_URL}
    
    # Build Docker image
    cd backend
    docker build -t ${ECR_REPOSITORY_URL}:latest .
    docker build -t ${ECR_REPOSITORY_URL}:${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S) .
    
    # Push images
    docker push ${ECR_REPOSITORY_URL}:latest
    docker push ${ECR_REPOSITORY_URL}:${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S)
    
    print_success "Backend image built and pushed"
    cd ..
}

# Build and deploy frontend
build_and_deploy_frontend() {
    print_step "Building and Deploying Frontend"
    
    cd frontend
    
    # Install dependencies
    npm ci
    
    # Build for production
    npm run build
    
    # Sync to S3
    aws s3 sync dist/ s3://${S3_BUCKET_NAME}/ --delete --cache-control "public, max-age=31536000" --exclude "*.html"
    aws s3 sync dist/ s3://${S3_BUCKET_NAME}/ --delete --cache-control "public, max-age=0, must-revalidate" --include "*.html"
    
    # Invalidate CloudFront cache
    aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} --paths "/*"
    
    print_success "Frontend deployed"
    cd ..
}

# Wait for backend deployment to be ready
wait_for_backend() {
    print_step "Waiting for Backend Deployment"
    
    kubectl rollout status deployment/backend -n ${PROJECT_NAME}-app --timeout=600s
    
    print_success "Backend deployment is ready"
}

# Run database migrations
run_migrations() {
    print_step "Running Database Migrations"
    
    # Get a backend pod name
    BACKEND_POD=$(kubectl get pods -n ${PROJECT_NAME}-app -l app=backend -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$BACKEND_POD" ]; then
        kubectl exec -n ${PROJECT_NAME}-app $BACKEND_POD -- npm run migrate
        print_success "Database migrations completed"
    else
        print_warning "No backend pods found, skipping migrations"
    fi
}

# Display deployment information
show_deployment_info() {
    print_step "Deployment Information"
    
    cd infrastructure
    
    echo -e "${BLUE}Cluster Information:${NC}"
    echo "  EKS Cluster: $(terraform output -raw cluster_id)"
    echo "  Region: ${AWS_REGION}"
    
    echo -e "${BLUE}Application URLs:${NC}"
    echo "  Frontend: $(terraform output -raw frontend_url)"
    echo "  API: $(terraform output -raw api_endpoint)"
    
    echo -e "${BLUE}Useful Commands:${NC}"
    echo "  Configure kubectl: aws eks update-kubeconfig --region ${AWS_REGION} --name $(terraform output -raw cluster_id)"
    echo "  View backend logs: kubectl logs -n ${PROJECT_NAME}-app -l app=backend -f"
    echo "  Port forward to database: kubectl port-forward -n ${PROJECT_NAME}-database service/postgres-service 5432:5432"
    echo "  Get database password: terraform output -raw database_password"
    
    cd ..
    
    print_success "Deployment completed successfully!"
}

# Cleanup function
cleanup() {
    print_step "Cleaning up temporary files"
    
    if [ -f "infrastructure/tfplan" ]; then
        rm infrastructure/tfplan
    fi
}

# Main deployment function
main() {
    echo -e "${GREEN}"
    echo "=========================================="
    echo "  Hotel Management System Deployment"
    echo "=========================================="
    echo -e "${NC}"
    
    # Trap cleanup on exit
    trap cleanup EXIT
    
    check_prerequisites
    init_terraform
    plan_terraform
    
    # Confirm before applying
    echo -e "${YELLOW}About to deploy infrastructure. Continue? (y/N)${NC}"
    read -r confirmation
    if [[ ! $confirmation =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
    
    apply_terraform
    configure_kubectl
    build_and_push_backend
    build_and_deploy_frontend
    wait_for_backend
    run_migrations
    show_deployment_info
}

# Handle command line arguments
case "${1:-}" in
    "plan")
        check_prerequisites
        init_terraform
        plan_terraform
        ;;
    "apply")
        check_prerequisites
        init_terraform
        apply_terraform
        configure_kubectl
        ;;
    "build-backend")
        build_and_push_backend
        ;;
    "build-frontend")
        build_and_deploy_frontend
        ;;
    "destroy")
        print_warning "This will destroy all infrastructure. Are you sure? (type 'yes' to confirm)"
        read -r confirmation
        if [[ $confirmation == "yes" ]]; then
            cd infrastructure
            terraform destroy -auto-approve
            print_success "Infrastructure destroyed"
        else
            print_warning "Destruction cancelled"
        fi
        ;;
    *)
        main
        ;;
esac