# GitHub Actions Setup Guide

This document explains how to set up CI/CD for your hotel management system using GitHub Actions.

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **AWS Account**: With appropriate permissions for EKS, ECR, S3, CloudFront
3. **AWS IAM User**: With programmatic access for GitHub Actions

## 🔐 Required Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add these secrets:

### Essential Secrets

```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

### Optional Secrets (for enhanced features)

```
BACKUP_S3_BUCKET=your-backup-bucket-name
DOCKER_REGISTRY_URL=your_custom_registry_url
NOTIFICATION_WEBHOOK=your_slack_or_teams_webhook
```

## 🏗️ Workflow Overview

We've created 4 main workflows:

### 1. CI Pipeline (`ci.yml`)

**Triggers**: Pull requests, feature branches
**Purpose**: Code quality, security, and testing

**What it does**:

- ✅ Security scanning (secrets, vulnerabilities)
- ✅ Code quality checks (linting, type checking)
- ✅ Frontend/backend builds
- ✅ Docker image builds
- ✅ Infrastructure validation
- 📝 Automated PR comments with results

### 2. Deployment Pipeline (`deploy.yml`)

**Triggers**: Push to main/frontend-setup, manual dispatch
**Purpose**: Automated deployment to AWS

**What it does**:

- 🧪 Runs all tests
- 🏗️ Deploys infrastructure with Terraform
- 🐳 Builds and pushes Docker images to ECR
- ⚙️ Updates Kubernetes deployments
- 🌐 Deploys frontend to S3 + CloudFront
- 🗄️ Runs database migrations
- 💰 Cost-optimized for demo (t3.micro, spot instances)

### 3. Database Operations (`database.yml`)

**Triggers**: Manual dispatch only
**Purpose**: Database management

**Available Operations**:

- `migrate`: Apply database migrations
- `rollback`: Rollback specific migrations
- `seed`: Populate with initial data
- `backup`: Create database backup
- `restore`: Restore from backup (requires implementation)

### 4. Infrastructure Management (`infrastructure.yml`)

**Triggers**: Manual dispatch only
**Purpose**: Infrastructure lifecycle management

**Available Operations**:

- `plan`: Show planned changes
- `apply`: Apply infrastructure changes
- `destroy`: Destroy infrastructure (non-prod only)
- `refresh`: Refresh state
- `import`: Import existing resources

## 🚀 Getting Started

### Step 1: Set up AWS IAM User

Create an IAM user with these policies:

- `AmazonEKSClusterPolicy`
- `AmazonEKSWorkerNodePolicy`
- `AmazonEKS_CNI_Policy`
- `AmazonEC2ContainerRegistryPowerUser`
- `AmazonS3FullAccess`
- `CloudFrontFullAccess`
- `AmazonVPCFullAccess`
- Custom policy for EKS node groups

### Step 2: Add GitHub Secrets

1. Go to your repo → Settings → Secrets and variables → Actions
2. Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### Step 3: Initial Deployment

1. Push your code to the `main` or `frontend-setup` branch
2. The deployment workflow will automatically run
3. Monitor the progress in the Actions tab

### Step 4: Manual Operations (Optional)

Use the manual workflows for:

- Database operations
- Infrastructure changes
- Environment-specific deployments

## 🔧 Customization

### Environment Variables

Edit these in the workflow files if needed:

```yaml
env:
  AWS_REGION: us-east-1 # Change your preferred region
  PROJECT_NAME: hotel-management-system # Change project name
```

### Cost Optimization

The current setup is optimized for demo use:

- **Instance Type**: t3.micro
- **Node Count**: 1-2 nodes
- **Capacity Type**: SPOT instances
- **Storage**: 10GB

For production, update `variables.tf`:

```hcl
# Production settings
node_instance_types = ["t3.medium", "t3.large"]
node_capacity_type = "ON_DEMAND"
node_desired_capacity = 2
node_max_capacity = 5
```

### Branch Protection

Consider setting up branch protection rules:

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Require status checks to pass:
   - `security-scan`
   - `code-quality`
   - `infrastructure-check`
   - `docker-build-test`

## 📊 Monitoring & Debugging

### Workflow Status

- ✅ All green: Ready to deploy
- ❌ Red: Check the failed job logs
- 🟡 Yellow: In progress

### Common Issues

**1. AWS Credentials Invalid**

```
Error: UnauthorizedOperation
```

**Solution**: Check if AWS secrets are correctly set

**2. Terraform State Lock**

```
Error: Error locking state
```

**Solution**: Wait for other operations to complete, or break lock if needed

**3. EKS Cluster Not Ready**

```
Error: connection refused
```

**Solution**: Wait for cluster to be fully provisioned (10-15 minutes)

**4. Docker Build Failed**

```
Error: build failed
```

**Solution**: Check Dockerfile syntax and dependencies

### Debugging Commands

Access your cluster for debugging:

```bash
aws eks update-kubeconfig --region us-east-1 --name hotel-management-system-dev-cluster
kubectl get pods -n hotel-management-system-app
kubectl logs -n hotel-management-system-app deployment/backend
```

## 🔄 Workflow Triggers

### Automatic Triggers

- **Push to main**: Full deployment
- **Pull Request**: CI checks only
- **Push to feature branch**: CI checks only

### Manual Triggers

All workflows can be triggered manually:

1. Go to Actions tab
2. Select workflow
3. Click "Run workflow"
4. Choose parameters

## 📈 Advanced Features

### Multi-Environment Support

The workflows support multiple environments:

- `dev`: Development (auto-deploy)
- `staging`: Staging (manual approval)
- `prod`: Production (manual approval + restrictions)

### Environment Protection Rules

Set up environment protection in Settings → Environments:

1. Create `production` environment
2. Add required reviewers
3. Set deployment branches to `main` only

### Notifications

Add Slack/Teams notifications by setting `NOTIFICATION_WEBHOOK` secret and customizing the workflow.

## 💡 Best Practices

1. **Security**:

   - Never commit secrets to code
   - Use least-privilege IAM policies
   - Regular security scans

2. **Cost Management**:

   - Use spot instances for dev/staging
   - Monitor AWS costs regularly
   - Destroy dev environments when not needed

3. **Deployment**:

   - Always test in dev first
   - Use feature branches for changes
   - Monitor deployments closely

4. **Database**:
   - Always backup before migrations
   - Test migrations in dev first
   - Keep migration scripts in version control

## 🆘 Support

If you encounter issues:

1. Check the workflow logs in GitHub Actions
2. Verify AWS credentials and permissions
3. Check Terraform state and resources
4. Monitor Kubernetes cluster status
5. Review application logs

The workflows are designed to provide detailed feedback and summaries for easier debugging and monitoring.
