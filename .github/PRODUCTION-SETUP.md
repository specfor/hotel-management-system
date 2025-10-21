# Production Branch CI/CD Setup Guide

## 🚨 IMPORTANT: Production Branch Workflow

Your CI/CD system is now configured to only deploy to production servers when changes are made to the **`production`** branch. This provides a secure deployment model where:

### ✅ What This Means:

- **Development/Staging**: Deploy from `main`, `frontend-setup`, `develop` branches
- **Production**: Deploy ONLY from `production` branch
- **Safety**: Production infrastructure changes require the `production` branch
- **Security**: Database operations on production require the `production` branch

## 🔄 Deployment Workflow

### Branch Strategy:

```
feature/branch → develop → main → production
     ↓             ↓        ↓         ↓
   CI only    Dev Deploy  Staging   Production
```

### 1. Development & Staging Deployments

**Branches**: `main`, `frontend-setup`, `develop`
**Workflow**: `deploy-dev.yml`
**Triggers**: Automatic on push
**Environments**:

- `develop` branch → dev environment
- `main` branch → staging environment
- Manual dispatch → choose dev/staging

### 2. Production Deployments

**Branch**: `production` ONLY
**Workflow**: `deploy.yml`
**Triggers**: Push to production branch, manual dispatch
**Environment**: Production with enhanced resources

## 🛡️ Security Features

### Branch Protection for Production:

- All production operations validate the source branch
- Infrastructure changes to production require `production` branch
- Database operations on production require `production` branch
- Automatic rejection if wrong branch is used

### Production Configuration:

- **Instance Type**: t3.medium (instead of t3.micro)
- **Capacity**: 2-5 nodes (instead of 1-2)
- **Instance Type**: ON_DEMAND (instead of SPOT)
- **Storage**: 100GB (instead of 10GB)
- **Environment**: Enhanced monitoring and backups

## 🚀 How to Deploy to Production

### Method 1: Branch Merge (Recommended)

```bash
# 1. Merge your changes to production branch
git checkout production
git merge main  # or specific feature branch
git push origin production

# 2. Deployment triggers automatically
```

### Method 2: Manual Dispatch

1. Go to GitHub Actions tab
2. Select "Deploy to AWS" workflow
3. Click "Run workflow"
4. Ensure you're on `production` branch
5. Select "prod" environment

## 🔧 Environment-Specific Settings

### Development (`deploy-dev.yml`)

```yaml
# Cost-optimized for development
node_instance_types: ["t3.micro"]
node_capacity_type: "SPOT"
node_desired_capacity: 1
db_allocated_storage: 10
estimated_cost: ~$110/month
```

### Production (`deploy.yml`)

```yaml
# Performance-optimized for production
node_instance_types: ["t3.medium"]
node_capacity_type: "ON_DEMAND"
node_desired_capacity: 2
node_max_capacity: 5
db_allocated_storage: 100
estimated_cost: ~$300/month
```

## 📋 Workflow Files Overview

### 1. `ci.yml` - Code Quality & Testing

- **Triggers**: PRs to main/frontend-setup/production, feature branches
- **Purpose**: Security scanning, linting, testing, validation
- **No Deployments**: Only validates code quality

### 2. `deploy.yml` - Production Deployment

- **Triggers**: Push to `production` branch only
- **Purpose**: Deploy to production AWS environment
- **Validation**: Enforces production branch requirement

### 3. `deploy-dev.yml` - Dev/Staging Deployment

- **Triggers**: Push to main/frontend-setup/develop
- **Purpose**: Deploy to development and staging environments
- **Cost-Optimized**: Uses cheaper resources for testing

### 4. `database.yml` - Database Operations

- **Triggers**: Manual dispatch only
- **Purpose**: Migrations, seeding, backups
- **Protection**: Production operations require `production` branch

### 5. `infrastructure.yml` - Infrastructure Management

- **Triggers**: Manual dispatch only
- **Purpose**: Terraform operations (plan/apply/destroy)
- **Protection**: Production changes require `production` branch

## ⚡ Quick Start Commands

### For Development:

```bash
# Work on features
git checkout -b feature/new-feature
# ... make changes ...
git push origin feature/new-feature
# Create PR to main → triggers CI

# Deploy to staging
git checkout main
git merge feature/new-feature
git push origin main  # → triggers staging deployment
```

### For Production:

```bash
# Deploy to production (after testing in staging)
git checkout production
git merge main
git push origin production  # → triggers production deployment
```

## 🔍 Monitoring & Validation

### Pre-Deployment Checks:

- ✅ All tests pass on feature branch
- ✅ Code review completed
- ✅ Staging deployment successful
- ✅ Manual testing in staging environment
- ✅ Security scans clean

### Post-Deployment Verification:

- 🌐 Frontend URL accessible
- 🚀 API health check passes
- 🗄️ Database migrations successful
- 📊 Monitoring alerts normal
- 🔒 Security configurations active

## 🆘 Emergency Procedures

### Rollback Production:

```bash
# Option 1: Revert to previous commit
git checkout production
git revert HEAD
git push origin production

# Option 2: Reset to known good commit
git checkout production
git reset --hard <good-commit-sha>
git push --force-with-lease origin production
```

### Hotfix Process:

```bash
# Create hotfix directly from production
git checkout production
git checkout -b hotfix/critical-fix
# ... make minimal fix ...
git push origin hotfix/critical-fix
# Create PR to production branch
```

## 📞 Support & Troubleshooting

### Common Issues:

**1. "Production deployment blocked"**

- ✅ Ensure you're pushing to `production` branch
- ✅ Check GitHub Actions logs for validation errors

**2. "Infrastructure changes rejected"**

- ✅ Manual infrastructure operations on prod require `production` branch
- ✅ Switch to production branch before running manual workflows

**3. "Database operation failed"**

- ✅ Production database operations require `production` branch
- ✅ Verify cluster connectivity and pod status

### Getting Help:

1. Check GitHub Actions workflow logs
2. Review deployment summaries in workflow runs
3. Verify AWS resource status in console
4. Check application logs with `kubectl logs`

This production branch strategy ensures that your production environment is only updated through controlled, validated processes while maintaining fast iteration for development and staging environments.
