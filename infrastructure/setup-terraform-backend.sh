#!/bin/bash

# setup-terraform-backend.sh
# This script sets up the S3 bucket and DynamoDB table for Terraform state management

set -e

echo "🚀 Setting up Terraform state backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

print_status "AWS credentials verified"

# Backup current main.tf
if [ -f "main.tf" ]; then
    cp main.tf main.tf.backup
    print_status "Backed up main.tf to main.tf.backup"
fi

# Temporarily disable the backend in main.tf
print_status "Temporarily disabling backend configuration..."
cat > main.tf.temp << 'EOF'
# main.tf (temporary - without backend)

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
EOF

# Move original main.tf and use temp
mv main.tf main.tf.with-backend
mv main.tf.temp main.tf

# Initialize and apply bootstrap
print_status "Initializing Terraform for bootstrap..."
terraform init

print_status "Creating S3 bucket and DynamoDB table for state management..."
terraform apply -target=aws_s3_bucket.terraform_state -target=aws_dynamodb_table.terraform_locks -auto-approve

# Get outputs
BUCKET_NAME=$(terraform output -raw terraform_state_bucket)
TABLE_NAME=$(terraform output -raw terraform_locks_table)

print_success "Created S3 bucket: $BUCKET_NAME"
print_success "Created DynamoDB table: $TABLE_NAME"

# Restore main.tf with backend
mv main.tf.with-backend main.tf

print_status "Migrating state to S3 backend..."
# Reinitialize with backend
terraform init -migrate-state -force-copy

print_success "Terraform state backend setup complete!"
print_status "State is now stored in S3 bucket: $BUCKET_NAME"
print_status "State locking uses DynamoDB table: $TABLE_NAME"

# Clean up
rm -f bootstrap-state.tf
rm -f main.tf.backup

echo ""
print_success "✨ Setup complete! Your Terraform state is now managed remotely."
print_warning "🔒 Make sure your CI/CD has access to the S3 bucket and DynamoDB table."