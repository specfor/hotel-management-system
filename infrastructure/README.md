# Hotel Management System - AWS Infrastructure

This directory contains Terraform configurations to deploy the Hotel Management System on AWS using EKS (Elastic Kubernetes Service), S3, CloudFront, and other AWS services.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │    │       EKS        │    │   PostgreSQL    │
│   (Frontend)    │───▶│    (Backend)     │───▶│   (Database)    │
│      + S3       │    │                  │    │    Container    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Route53 DNS   │    │  Load Balancer   │    │ Persistent Vol  │
│   (Optional)    │    │     (ALB)        │    │     (EBS)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Infrastructure Components

### 1. **Amazon EKS Cluster**

- Managed Kubernetes cluster for running containerized applications
- Auto-scaling node groups with configurable instance types
- Private and public subnets across multiple availability zones
- Security groups with least-privilege access

### 2. **Backend Application**

- Node.js/TypeScript application running in Kubernetes pods
- Deployed via Docker containers stored in Amazon ECR
- Horizontal pod autoscaling based on CPU/memory usage
- Health checks and rolling updates

### 3. **PostgreSQL Database**

- PostgreSQL 15 running as a Kubernetes deployment
- Persistent storage using Amazon EBS volumes
- Automated backups and point-in-time recovery
- Internal cluster networking for security

### 4. **Frontend Hosting**

- Static files hosted on Amazon S3
- Global content delivery via Amazon CloudFront
- Custom domain support with SSL/TLS certificates
- Automatic cache invalidation on deployments

### 5. **Networking & Security**

- VPC with private and public subnets
- NAT Gateways for outbound internet access
- Application Load Balancer for ingress traffic
- Security groups with minimal required access

## Prerequisites

Before deploying, ensure you have:

1. **AWS CLI** configured with appropriate permissions
2. **Terraform** (>= 1.0)
3. **kubectl** for Kubernetes management
4. **Docker** for building container images
5. **Node.js & npm** for building the frontend

### Required AWS Permissions

Your AWS user/role needs permissions for:

- EKS cluster management
- EC2 instance management
- VPC and networking resources
- S3 bucket operations
- CloudFront distributions
- Route53 (if using custom domain)
- ECR repositories
- IAM role creation

## Quick Start

### 1. Clone and Navigate

```bash
git clone <your-repo>
cd hotel-management-system/infrastructure
```

### 2. Configure Variables

Create a `terraform.tfvars` file:

```hcl
project_name = "hotel-management-system"
environment  = "dev"
aws_region   = "us-east-1"

# Optional: Custom domain
domain_name = "your-domain.com"

# Customize instance types and capacity
node_instance_types    = ["t3.medium"]
node_desired_capacity  = 2
node_max_capacity     = 4
node_min_capacity     = 1
```

### 3. Deploy Everything

```bash
# Make scripts executable (if not already)
chmod +x deploy.sh build.sh

# Deploy the complete infrastructure
./deploy.sh
```

### 4. Alternative: Step-by-Step Deployment

```bash
# Initialize and plan
./deploy.sh plan

# Apply infrastructure only
./deploy.sh apply

# Build and push backend
./build.sh full-backend latest <ECR_URL> us-east-1

# Build and deploy frontend
./build.sh full-frontend <S3_BUCKET> <CLOUDFRONT_ID>
```

## Script Usage

### Main Deployment Script (`deploy.sh`)

```bash
# Full deployment
./deploy.sh

# Plan only (no changes)
./deploy.sh plan

# Apply infrastructure only
./deploy.sh apply

# Destroy everything
./deploy.sh destroy
```

### Build Script (`build.sh`)

```bash
# Build backend Docker image
./build.sh backend latest <ECR_URL>

# Build frontend
./build.sh frontend

# Full backend pipeline
./build.sh full-backend latest <ECR_URL> us-east-1 hotel-management-system-app

# Full frontend pipeline
./build.sh full-frontend <S3_BUCKET> <CLOUDFRONT_ID>

# Run database migrations
./build.sh migrate hotel-management-system-app

# Health check
./build.sh health-check https://your-api-endpoint.com
```

## Configuration Options

### Environment Variables

```bash
export AWS_REGION=us-east-1
export ENVIRONMENT=dev
export PROJECT_NAME=hotel-management-system
```

### Terraform Variables

Key variables you can customize in `terraform.tfvars`:

| Variable                | Description                      | Default                   |
| ----------------------- | -------------------------------- | ------------------------- |
| `project_name`          | Project name for resource naming | `hotel-management-system` |
| `environment`           | Environment (dev/staging/prod)   | `dev`                     |
| `aws_region`            | AWS region for resources         | `us-east-1`               |
| `domain_name`           | Custom domain (optional)         | `""`                      |
| `node_instance_types`   | EKS node instance types          | `["t3.medium"]`           |
| `node_desired_capacity` | Desired number of nodes          | `2`                       |
| `vpc_cidr`              | VPC CIDR block                   | `10.0.0.0/16`             |

## Post-Deployment Operations

### Access the Application

After deployment, you'll get output with:

- Frontend URL (CloudFront domain or custom domain)
- API endpoint
- Useful management commands

### Connect to Database

```bash
# Port forward to access database locally
kubectl port-forward -n hotel-management-system-database service/postgres-service 5432:5432

# Get database password
terraform output -raw database_password

# Connect using psql
psql -h localhost -p 5432 -U postgres -d hotelmanagement
```

### Monitor Application

```bash
# View backend logs
kubectl logs -n hotel-management-system-app -l app=backend -f

# Check pod status
kubectl get pods -n hotel-management-system-app

# Restart backend deployment
kubectl rollout restart deployment/backend -n hotel-management-system-app
```

### Update Application

```bash
# Backend updates
./build.sh full-backend latest <ECR_URL> us-east-1

# Frontend updates
./build.sh full-frontend <S3_BUCKET> <CLOUDFRONT_ID>

# Database migrations
./build.sh migrate hotel-management-system-app
```

## Security Considerations

1. **Database Access**: Database is only accessible within the cluster
2. **API Security**: Backend pods run as non-root user
3. **Network Security**: Private subnets with NAT Gateway for outbound access
4. **Encryption**: S3 server-side encryption enabled
5. **Secrets Management**: Sensitive data stored in Kubernetes secrets

## Backup & Recovery

### Database Backups

The PostgreSQL deployment includes:

- Persistent volume for data storage
- Regular automated backups (configure separately)
- Point-in-time recovery capabilities

### Application Recovery

- Container images are versioned in ECR
- Infrastructure can be recreated from Terraform state
- Frontend assets are backed up in S3 versioning

## Monitoring & Logging

### Built-in Monitoring

- EKS cluster logging enabled
- CloudWatch integration
- Application health checks
- Load balancer health monitoring

### Optional Enhancements

Consider adding:

- Prometheus + Grafana for metrics
- ELK stack for log aggregation
- AWS X-Ray for distributed tracing

## Cost Optimization

### Current Setup Costs (Estimated)

**Production Configuration:**

- EKS cluster: ~$75/month
- EC2 nodes (t3.medium x2): ~$60/month
- Load balancer: ~$20/month
- S3 + CloudFront: ~$5/month
- **Total**: ~$160/month

**Demo/Development Configuration (DEFAULT):**

- EKS cluster: ~$75/month
- EC2 node (t3.micro x1): ~$9/month 💰
- Load balancer: ~$20/month
- S3 + CloudFront: ~$5/month
- **Total**: ~$110/month 💰

**Ultra-Low Cost Demo (with Spot instances):**

- EKS cluster: ~$75/month
- EC2 node (t3.micro x1 SPOT): ~$3/month 💰💰
- Load balancer: ~$20/month
- S3 + CloudFront: ~$5/month
- **Total**: ~$103/month 💰💰

### Cost Reduction Options

1. ✅ **Applied**: Use t3.micro instances (90% savings on compute)
2. ✅ **Available**: Use Spot instances (`node_capacity_type = "SPOT"`) for 70% additional savings
3. **Advanced**: Use Fargate for pay-per-use computing
4. **Operational**: Implement scheduled shutdown for demo environments

## Troubleshooting

### Common Issues

#### EKS Cluster Access

```bash
# Update kubeconfig
aws eks update-kubeconfig --region us-east-1 --name <cluster-name>

# Verify access
kubectl get nodes
```

#### Backend Pod Issues

```bash
# Check pod status
kubectl describe pod <pod-name> -n hotel-management-system-app

# View logs
kubectl logs <pod-name> -n hotel-management-system-app

# Check service
kubectl get svc -n hotel-management-system-app
```

#### Database Connection Issues

```bash
# Check database pod
kubectl get pods -n hotel-management-system-database

# Test database connection
kubectl exec -it <postgres-pod> -n hotel-management-system-database -- psql -U postgres -d hotelmanagement
```

#### Frontend Issues

```bash
# Check S3 sync
aws s3 ls s3://<bucket-name>/

# Check CloudFront status
aws cloudfront get-distribution --id <distribution-id>

# Manual cache invalidation
aws cloudfront create-invalidation --distribution-id <distribution-id> --paths "/*"
```

## Cleanup

### Destroy Infrastructure

```bash
./deploy.sh destroy
```

### Manual Cleanup (if needed)

```bash
# Delete ECR images
aws ecr batch-delete-image --repository-name <repo-name> --image-ids imageTag=latest

# Empty S3 bucket
aws s3 rm s3://<bucket-name> --recursive

# Then run terraform destroy
cd infrastructure
terraform destroy
```

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review AWS CloudFormation events
3. Check Kubernetes events: `kubectl get events --all-namespaces`
4. Review application logs

## License

This infrastructure code is part of the Hotel Management System project.
