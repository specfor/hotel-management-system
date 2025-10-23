# 🎓 AWS Free Tier Campus Deployment Guide

This guide provides instructions for deploying the Hotel Management System using AWS Free Tier resources, perfect for campus projects with $0 monthly cost.

## 🆓 Free Tier Architecture Overview

Our campus deployment uses the following AWS Free Tier services:

| Service           | Free Tier Limit | Monthly Cost |
| ----------------- | --------------- | ------------ |
| EC2 t3.micro      | 750 hours       | $0           |
| RDS db.t3.micro   | 750 hours       | $0           |
| S3 Storage        | 5 GB            | $0           |
| CloudFront        | 50 GB transfer  | $0           |
| VPC, Subnets, IGW | Unlimited       | $0           |
| **TOTAL**         |                 | **$0**       |

### 🚨 Services to AVOID (Not Free Tier)

- **EKS Clusters**: $73/month per cluster
- **NAT Gateways**: $45/month per gateway
- **Large EC2 instances**: t3.small and above cost money
- **RDS instances**: db.t3.small and above cost money

## 📁 Project Structure

```
hotel-management-system/
├── infrastructure/
│   ├── ec2-free-tier.tf      # Free tier EC2 deployment
│   ├── free-tier-override.tf # Cost warnings & overrides
│   ├── variables.tf          # Optimized for free tier
│   └── templates/
│       └── backend-userdata.sh # EC2 initialization script
├── .github/workflows/
│   └── deploy-campus.yml     # Free tier deployment pipeline
├── scripts/
│   └── monitor-free-tier.sh  # Free tier usage monitoring
├── .env.campus               # Campus environment template
└── docs/
    └── CAMPUS-DEPLOYMENT.md  # This file
```

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Terraform
wget https://releases.hashicorp.com/terraform/1.5.0/terraform_1.5.0_linux_amd64.zip
unzip terraform_1.5.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Configure AWS (use your campus/student credentials)
aws configure
```

### 2. Set Up Repository Secrets

Add these secrets to your GitHub repository:

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

### 3. Deploy Using Free Tier

```bash
# Clone and navigate to project
git clone <your-repo-url>
cd hotel-management-system

# Create campus branch for free tier deployment
git checkout -b campus
git push origin campus

# The GitHub Actions workflow will automatically deploy to AWS Free Tier
```

### 4. Manual Deployment (Alternative)

```bash
cd infrastructure

# Create terraform.tfvars for free tier
cat > terraform.tfvars << EOF
project_name = "hotel-management-system"
environment  = "campus"
aws_region   = "us-east-1"

# FREE TIER SETTINGS
node_instance_types   = ["t3.micro"]
node_desired_capacity = 1
node_max_capacity     = 1
node_min_capacity     = 1
db_instance_class     = "db.t3.micro"
db_allocated_storage  = 20

tags = {
  Environment = "campus"
  Project     = "hotel-management-system"
  CostMode    = "free-tier"
}
EOF

# Deploy infrastructure
terraform init
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

## 📊 Monitoring Free Tier Usage

Use our monitoring script to track your AWS usage:

```bash
# Check current free tier usage
./scripts/monitor-free-tier.sh

# Set up daily monitoring (optional)
echo "0 9 * * * /path/to/your/project/scripts/monitor-free-tier.sh" | crontab -
```

## 🏗️ Architecture Details

### Free Tier EC2 Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Free Tier                       │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────────────────────┐│
│  │   CloudFront    │    │            VPC                   ││
│  │   (FREE 50GB)   │    │                                  ││
│  └─────────────────┘    │  ┌─────────────┐  ┌─────────────┐││
│           │              │  │   Public    │  │   Private   │││
│           │              │  │   Subnet    │  │   Subnet    │││
│  ┌─────────────────┐    │  │             │  │             │││
│  │       S3        │    │  │ ┌─────────┐ │  │ ┌─────────┐ │││
│  │  Static Files   │    │  │ │   EC2   │ │  │ │   RDS   │ │││
│  │   (FREE 5GB)    │    │  │ │t3.micro │ │  │ │db.t3.   │ │││
│  └─────────────────┘    │  │ │ (FREE)  │ │  │ │micro    │ │││
│                          │  │ └─────────┘ │  │ │(FREE)   │ │││
│                          │  └─────────────┘  │ └─────────┘ │││
│                          └──────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

Monthly Cost: $0 (within AWS Free Tier limits)
```

### vs. Production EKS (NOT Free)

```
┌─────────────────────────────────────────────────────────────┐
│                    Production (COSTLY)                     │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────────────────────┐│
│  │   CloudFront    │    │        EKS Cluster               ││
│  │    ($0.085)     │    │      ($73/month)                 ││
│  └─────────────────┘    │                                  ││
│           │              │  ┌─────────────┐  ┌─────────────┐││
│           │              │  │   Public    │  │   Private   │││
│  ┌─────────────────┐    │  │   Subnet    │  │   Subnet    │││
│  │      ALB        │    │  │             │  │             │││
│  │   ($18/month)   │    │  │ ┌─────────┐ │  │ ┌─────────┐ │││
│  └─────────────────┘    │  │ │NAT Gateway│ │  │ │Worker   │ │││
│                          │  │ │($45/mo) │ │  │ │ Nodes   │ │││
│                          │  │ └─────────┘ │  │ │($25/mo) │ │││
│                          │  └─────────────┘  │ └─────────┘ │││
│                          └──────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

Monthly Cost: $118+ (NOT suitable for campus projects)
```

## 🔧 Configuration Files

### Environment Variables (.env.campus)

```bash
# Database Configuration
DB_HOST=<rds-endpoint>  # Will be populated by Terraform
DB_PORT=5432
DB_NAME=hotel_management_db
DB_USER=postgres
DB_PASSWORD=<generated-password>

# Application Settings
NODE_ENV=production
PORT=3000
JWT_SECRET=your_jwt_secret_for_campus_project_2024
JWT_EXPIRES_IN=24h

# Campus optimizations
DB_POOL_MIN=2
DB_POOL_MAX=10
LOG_LEVEL=info
```

### Terraform Variables (Free Tier)

```hcl
# infrastructure/terraform.tfvars
project_name = "hotel-management-system"
environment  = "campus"

# FREE TIER CONSTRAINTS
node_instance_types   = ["t3.micro"]    # Only free tier type
node_desired_capacity = 1               # Single instance
db_instance_class     = "db.t3.micro"   # Only free tier RDS
db_allocated_storage  = 20              # Free tier limit

# Single AZ to avoid cross-AZ charges
availability_zones = ["us-east-1a"]
```

## 🚨 Cost Alerts & Monitoring

### Setting Up Billing Alerts

1. Go to AWS Billing & Cost Management
2. Create a billing alert for $1 (safety net)
3. Add email notification

### Daily Usage Checks

```bash
# Add to crontab for daily monitoring
crontab -e

# Add this line:
0 9 * * * /path/to/hotel-management-system/scripts/monitor-free-tier.sh | mail -s "Daily AWS Usage" your@email.com
```

## 🐛 Troubleshooting

### Common Issues

1. **"Instance type not supported"**

   ```bash
   # Ensure you're using t3.micro
   echo 'node_instance_types = ["t3.micro"]' >> terraform.tfvars
   ```

2. **"RDS instance too expensive"**

   ```bash
   # Use only db.t3.micro
   echo 'db_instance_class = "db.t3.micro"' >> terraform.tfvars
   ```

3. **"Unexpected charges"**

   ```bash
   # Check for non-free tier resources
   ./scripts/monitor-free-tier.sh

   # Look for EKS clusters or NAT Gateways
   aws eks list-clusters
   aws ec2 describe-nat-gateways
   ```

### Clean Up Resources

```bash
# Destroy all resources to avoid charges
cd infrastructure
terraform destroy -auto-approve

# Verify no resources remain
./scripts/monitor-free-tier.sh
```

## 🎯 Campus Project Tips

1. **Stay Within Free Tier**: Always use t3.micro for EC2 and db.t3.micro for RDS
2. **Monitor Usage**: Run monitoring script weekly
3. **Single AZ**: Use only one availability zone to avoid data transfer charges
4. **No NAT Gateways**: Use Internet Gateway directly for cost savings
5. **S3 Hosting**: Host frontend in S3 + CloudFront (both free)

## 📚 Additional Resources

- [AWS Free Tier Details](https://aws.amazon.com/free/)
- [EC2 Pricing](https://aws.amazon.com/ec2/pricing/)
- [RDS Free Tier](https://aws.amazon.com/rds/free/)
- [S3 Free Tier](https://aws.amazon.com/s3/pricing/)

## 🆘 Support

For campus project support:

1. Check the troubleshooting section above
2. Run `./scripts/monitor-free-tier.sh` to identify issues
3. Ensure all resources are free tier eligible
4. Create GitHub issues for deployment problems

---

**Remember**: This configuration is designed for educational and campus projects. For production use, consider the full EKS deployment with appropriate scaling and security measures.
