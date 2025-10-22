#!/bin/bash

# cleanup-aws-resources.sh
# This script cleans up all existing AWS resources for a fresh deployment

set -e

echo "🧹 Cleaning up existing AWS resources..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to cleanup a resource safely
cleanup_resource() {
    local resource_type="$1"
    local command="$2"
    local resource_name="$3"
    
    print_status "Cleaning up $resource_type: $resource_name"
    if eval "$command" 2>/dev/null; then
        print_success "Cleaned up $resource_type: $resource_name"
    else
        print_warning "$resource_type $resource_name not found or already cleaned"
    fi
}

# Clean up EKS cluster if exists
print_status "Checking for EKS clusters..."
CLUSTERS=$(aws eks list-clusters --region us-east-1 --query 'clusters[?contains(@, `hotel-management-system-prod`)]' --output text)
if [ -n "$CLUSTERS" ]; then
    print_warning "Found EKS clusters. Manual cleanup required:"
    echo "$CLUSTERS"
else
    print_success "No EKS clusters found"
fi

# Clean up ECR repository
cleanup_resource "ECR Repository" \
    "aws ecr delete-repository --repository-name hotel-management-system-prod-backend --region us-east-1 --force" \
    "hotel-management-system-prod-backend"

# Clean up IAM Policy
cleanup_resource "IAM Policy" \
    "aws iam delete-policy --policy-arn arn:aws:iam::640272544168:policy/AWSLoadBalancerControllerIAMPolicy" \
    "AWSLoadBalancerControllerIAMPolicy"

# Clean up unused EIPs
print_status "Cleaning up unattached Elastic IPs..."
UNATTACHED_EIPS=$(aws ec2 describe-addresses --region us-east-1 --query 'Addresses[?AssociationId==null].AllocationId' --output text)
if [ -n "$UNATTACHED_EIPS" ]; then
    for eip in $UNATTACHED_EIPS; do
        cleanup_resource "Elastic IP" \
            "aws ec2 release-address --allocation-id $eip --region us-east-1" \
            "$eip"
    done
else
    print_success "No unattached Elastic IPs found"
fi

# Clean up VPCs with hotel-management prefix
print_status "Checking for VPCs to clean up..."
VPCS=$(aws ec2 describe-vpcs --region us-east-1 --filters "Name=tag:Project,Values=hotel-management-system" --query 'Vpcs[].VpcId' --output text)
if [ -n "$VPCS" ]; then
    print_warning "Found VPCs that may need cleanup:"
    echo "$VPCS"
    print_warning "Please manually delete these VPCs and their associated resources if needed"
else
    print_success "No project VPCs found"
fi

print_success "Cleanup completed!"
print_warning "Note: Some resources like VPCs and associated network resources may need manual cleanup"
print_status "After cleanup, you can run the deployment again"