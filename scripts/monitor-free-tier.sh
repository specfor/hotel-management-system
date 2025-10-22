#!/bin/bash

# 🎓 Campus AWS Free Tier Usage Monitor
# This script helps monitor AWS resource usage for the campus project

set -e

echo "🎓 AWS Free Tier Campus Project Monitor"
echo "======================================="

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &>/dev/null; then
    echo "❌ AWS CLI not configured. Please run 'aws configure'"
    exit 1
fi

echo "✅ AWS Account: $(aws sts get-caller-identity --query Account --output text)"
echo "✅ Region: $(aws configure get region)"
echo ""

echo "📊 FREE TIER RESOURCE USAGE:"
echo "----------------------------"

# EC2 Instances
echo "🖥️  EC2 Instances:"
instances=$(aws ec2 describe-instances \
    --filters "Name=instance-state-name,Values=running" \
    --query 'Reservations[].Instances[].[InstanceId,InstanceType,LaunchTime]' \
    --output table)

if [ -z "$instances" ] || [ "$instances" = "None" ]; then
    echo "   No running instances"
else
    echo "$instances"
    
    # Count t3.micro instances
    t3_micro_count=$(aws ec2 describe-instances \
        --filters "Name=instance-state-name,Values=running" "Name=instance-type,Values=t3.micro" \
        --query 'length(Reservations[].Instances[])')
    
    echo "   🆓 t3.micro instances: $t3_micro_count/1 (FREE TIER LIMIT)"
    
    if [ "$t3_micro_count" -gt 1 ]; then
        echo "   ⚠️  WARNING: Exceeding free tier limit!"
    fi
fi
echo ""

# RDS Instances
echo "🗄️  RDS Instances:"
rds_instances=$(aws rds describe-db-instances \
    --query 'DBInstances[].[DBInstanceIdentifier,DBInstanceClass,DBInstanceStatus]' \
    --output table 2>/dev/null || echo "None")

if [ "$rds_instances" = "None" ] || [ -z "$rds_instances" ]; then
    echo "   No RDS instances"
else
    echo "$rds_instances"
    
    # Count db.t3.micro instances
    db_micro_count=$(aws rds describe-db-instances \
        --query 'length(DBInstances[?DBInstanceClass==`db.t3.micro`])' 2>/dev/null || echo "0")
    
    echo "   🆓 db.t3.micro instances: $db_micro_count/1 (FREE TIER LIMIT)"
    
    if [ "$db_micro_count" -gt 1 ]; then
        echo "   ⚠️  WARNING: Exceeding free tier limit!"
    fi
fi
echo ""

# S3 Buckets and usage
echo "🪣 S3 Storage:"
buckets=$(aws s3 ls --output text | wc -l)
echo "   Total buckets: $buckets"

if [ "$buckets" -gt 0 ]; then
    echo "   Bucket sizes:"
    aws s3 ls | while read -r line; do
        bucket_name=$(echo "$line" | awk '{print $3}')
        size=$(aws s3 ls s3://"$bucket_name" --recursive --summarize --human-readable 2>/dev/null | tail -1 | awk '{print $3, $4}' || echo "Error")
        echo "     - $bucket_name: $size"
    done
    echo "   🆓 FREE TIER LIMIT: 5 GB"
fi
echo ""

# VPC Resources (always free)
echo "🌐 VPC Resources (FREE):"
vpcs=$(aws ec2 describe-vpcs --query 'length(Vpcs)')
echo "   VPCs: $vpcs"

subnets=$(aws ec2 describe-subnets --query 'length(Subnets)')
echo "   Subnets: $subnets"

igws=$(aws ec2 describe-internet-gateways --query 'length(InternetGateways)')
echo "   Internet Gateways: $igws"

# Check for NAT Gateways (NOT FREE!)
nat_gws=$(aws ec2 describe-nat-gateways \
    --filter "Name=state,Values=available" \
    --query 'length(NatGateways)')
echo "   💰 NAT Gateways: $nat_gws (⚠️ $45/month each!)"

if [ "$nat_gws" -gt 0 ]; then
    echo "   🚨 COST ALERT: NAT Gateways are NOT free tier!"
fi
echo ""

# EKS Clusters (NOT FREE!)
echo "☸️  EKS Clusters:"
eks_clusters=$(aws eks list-clusters --query 'length(clusters)' 2>/dev/null || echo "0")
echo "   EKS clusters: $eks_clusters (⚠️ $73/month each!)"

if [ "$eks_clusters" -gt 0 ]; then
    echo "   🚨 COST ALERT: EKS is NOT free tier!"
    aws eks list-clusters --query 'clusters[]' --output table 2>/dev/null || true
fi
echo ""

# Load Balancers (Classic and ALB)
echo "⚖️  Load Balancers:"
classic_lbs=$(aws elb describe-load-balancers --query 'length(LoadBalancerDescriptions)' 2>/dev/null || echo "0")
albs=$(aws elbv2 describe-load-balancers --query 'length(LoadBalancers)' 2>/dev/null || echo "0")
echo "   Classic LBs: $classic_lbs"
echo "   Application LBs: $albs"
echo "   🆓 FREE TIER: 750 hours/month combined"
echo ""

# CloudFront Distributions
echo "🌍 CloudFront Distributions:"
cf_distributions=$(aws cloudfront list-distributions --query 'length(DistributionList.Items)' 2>/dev/null || echo "0")
echo "   Distributions: $cf_distributions"
echo "   🆓 FREE TIER: 50GB data transfer/month"
echo ""

echo "📋 CAMPUS PROJECT RECOMMENDATIONS:"
echo "-----------------------------------"
echo "✅ Keep all EC2 instances as t3.micro"
echo "✅ Keep all RDS instances as db.t3.micro" 
echo "✅ Use CloudFront for frontend hosting (FREE)"
echo "✅ Store static files in S3 (FREE up to 5GB)"
echo "❌ Avoid EKS clusters ($73/month)"
echo "❌ Avoid NAT Gateways ($45/month each)"
echo "❌ Avoid large instance types"
echo ""

echo "💡 To check detailed billing:"
echo "   aws ce get-cost-and-usage --time-period Start=2024-01-01,End=$(date +%Y-%m-%d) --granularity MONTHLY --metrics BlendedCost"
echo ""

echo "🎓 Campus project should stay at $0/month for 12 months!"