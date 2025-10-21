#!/bin/bash

# build.sh - Build and deployment scripts for CI/CD

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}==== $1 ====${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Build backend Docker image
build_backend() {
    print_step "Building Backend Docker Image"
    
    local tag="${1:-latest}"
    local ecr_url="$2"
    
    cd backend
    
    # Build the Docker image
    docker build -t hotel-backend:$tag .
    
    # Tag for ECR if URL provided
    if [ -n "$ecr_url" ]; then
        docker tag hotel-backend:$tag $ecr_url:$tag
        print_success "Backend image built and tagged for ECR"
    else
        print_success "Backend image built"
    fi
    
    cd ..
}

# Push backend image to ECR
push_backend() {
    print_step "Pushing Backend Image to ECR"
    
    local tag="${1:-latest}"
    local ecr_url="$2"
    local region="${3:-us-east-1}"
    
    if [ -z "$ecr_url" ]; then
        print_error "ECR URL is required for pushing"
        exit 1
    fi
    
    # Login to ECR
    aws ecr get-login-password --region $region | docker login --username AWS --password-stdin $ecr_url
    
    # Push the image
    docker push $ecr_url:$tag
    
    print_success "Backend image pushed to ECR"
}

# Build frontend
build_frontend() {
    print_step "Building Frontend"
    
    cd frontend
    
    # Install dependencies
    npm ci
    
    # Build for production
    npm run build
    
    print_success "Frontend built successfully"
    cd ..
}

# Deploy frontend to S3
deploy_frontend() {
    print_step "Deploying Frontend to S3"
    
    local s3_bucket="$1"
    local cloudfront_id="$2"
    
    if [ -z "$s3_bucket" ]; then
        print_error "S3 bucket name is required"
        exit 1
    fi
    
    cd frontend
    
    # Sync static assets with long cache
    aws s3 sync dist/ s3://$s3_bucket/ \
        --delete \
        --cache-control "public, max-age=31536000" \
        --exclude "*.html" \
        --exclude "service-worker.js"
    
    # Sync HTML files with no cache
    aws s3 sync dist/ s3://$s3_bucket/ \
        --delete \
        --cache-control "public, max-age=0, must-revalidate" \
        --include "*.html"
    
    # Sync service worker with no cache
    aws s3 sync dist/ s3://$s3_bucket/ \
        --delete \
        --cache-control "public, max-age=0, must-revalidate" \
        --include "service-worker.js"
    
    # Invalidate CloudFront cache if distribution ID provided
    if [ -n "$cloudfront_id" ]; then
        aws cloudfront create-invalidation --distribution-id $cloudfront_id --paths "/*"
        print_success "CloudFront cache invalidated"
    fi
    
    print_success "Frontend deployed to S3"
    cd ..
}

# Update Kubernetes deployment
update_backend_deployment() {
    print_step "Updating Backend Deployment"
    
    local namespace="${1:-hotel-management-system-app}"
    local image_tag="${2:-latest}"
    local ecr_url="$3"
    
    if [ -z "$ecr_url" ]; then
        print_error "ECR URL is required for deployment update"
        exit 1
    fi
    
    # Update the deployment image
    kubectl set image deployment/backend backend=$ecr_url:$image_tag -n $namespace
    
    # Wait for rollout to complete
    kubectl rollout status deployment/backend -n $namespace --timeout=300s
    
    print_success "Backend deployment updated"
}

# Run database migrations
run_migrations() {
    print_step "Running Database Migrations"
    
    local namespace="${1:-hotel-management-system-app}"
    
    # Get a backend pod name
    local backend_pod=$(kubectl get pods -n $namespace -l app=backend -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$backend_pod" ]; then
        kubectl exec -n $namespace $backend_pod -- npm run migrate
        print_success "Database migrations completed"
    else
        print_error "No backend pods found"
        exit 1
    fi
}

# Health check
health_check() {
    print_step "Performing Health Check"
    
    local url="$1"
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url/health" > /dev/null; then
            print_success "Health check passed"
            return 0
        fi
        
        echo "Health check attempt $attempt/$max_attempts failed, waiting..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    print_error "Health check failed after $max_attempts attempts"
    return 1
}

# Clean up old Docker images
cleanup_images() {
    print_step "Cleaning Up Old Docker Images"
    
    # Remove dangling images
    docker image prune -f
    
    # Remove old hotel-backend images (keep latest 5)
    docker images hotel-backend --format "table {{.Tag}}\t{{.ID}}" | tail -n +2 | head -n -5 | awk '{print $2}' | xargs -r docker rmi
    
    print_success "Docker cleanup completed"
}

# Main function
main() {
    case "${1:-}" in
        "backend")
            build_backend "${2:-latest}" "$3"
            ;;
        "frontend")
            build_frontend
            ;;
        "push-backend")
            push_backend "${2:-latest}" "$3" "$4"
            ;;
        "deploy-frontend")
            deploy_frontend "$2" "$3"
            ;;
        "update-deployment")
            update_backend_deployment "$2" "$3" "$4"
            ;;
        "migrate")
            run_migrations "$2"
            ;;
        "health-check")
            health_check "$2"
            ;;
        "cleanup")
            cleanup_images
            ;;
        "full-backend")
            # Full backend pipeline: build -> push -> update deployment -> migrate
            local tag="${2:-latest}"
            local ecr_url="$3"
            local region="${4:-us-east-1}"
            local namespace="${5:-hotel-management-system-app}"
            
            build_backend "$tag" "$ecr_url"
            push_backend "$tag" "$ecr_url" "$region"
            update_backend_deployment "$namespace" "$tag" "$ecr_url"
            run_migrations "$namespace"
            ;;
        "full-frontend")
            # Full frontend pipeline: build -> deploy
            local s3_bucket="$2"
            local cloudfront_id="$3"
            
            build_frontend
            deploy_frontend "$s3_bucket" "$cloudfront_id"
            ;;
        *)
            echo "Usage: $0 {backend|frontend|push-backend|deploy-frontend|update-deployment|migrate|health-check|cleanup|full-backend|full-frontend}"
            echo ""
            echo "Commands:"
            echo "  backend [tag] [ecr_url]                    - Build backend Docker image"
            echo "  frontend                                   - Build frontend"
            echo "  push-backend [tag] [ecr_url] [region]      - Push backend image to ECR"
            echo "  deploy-frontend [s3_bucket] [cloudfront_id] - Deploy frontend to S3"
            echo "  update-deployment [namespace] [tag] [ecr_url] - Update Kubernetes deployment"
            echo "  migrate [namespace]                        - Run database migrations"
            echo "  health-check [url]                         - Perform application health check"
            echo "  cleanup                                    - Clean up old Docker images"
            echo "  full-backend [tag] [ecr_url] [region] [namespace] - Full backend pipeline"
            echo "  full-frontend [s3_bucket] [cloudfront_id]  - Full frontend pipeline"
            exit 1
            ;;
    esac
}

main "$@"