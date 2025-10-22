# Cost Optimization Guide for Demo Environment

## 💰 Demo/Development Cost Optimizations Applied

### Current Cost Reductions:

1. **EKS Nodes**: Changed from `t3.medium` (2 nodes) → `t3.micro` (1 node)
2. **Database Storage**: Reduced from 20GB → 10GB
3. **Container Resources**: Reduced CPU/memory requests by 50%
4. **Backend Replicas**: Reduced from 2 → 1 replica
5. **Database Resources**: Optimized for single node deployment

### Estimated Monthly Costs (DEMO):

- **EKS Cluster**: ~$75/month (fixed cost)
- **EC2 Node** (1x t3.micro): ~$9/month ⬇️ (was ~$60)
- **Load Balancer**: ~$20/month (fixed cost)
- **S3 + CloudFront**: ~$5/month
- **Database Storage**: ~$1/month ⬇️ (was ~$2)
- **Total**: **~$110/month** ⬇️ (was ~$160)

### Additional Cost Savings for Demo:

#### 1. Use Spot Instances (Save 70%)

Add to your `terraform.tfvars`:

```hcl
# Add spot instances for even more savings
node_capacity_type = "SPOT"
```

#### 2. Scheduled Shutdown (Save 50-70%)

For demo environments, consider:

- Shut down EKS cluster during non-demo hours
- Use AWS Instance Scheduler
- Run only during business hours

#### 3. Alternative: Use Fargate (Pay per use)

For very sporadic demo use:

- Switch to EKS Fargate (no always-on nodes)
- Pay only when pods are running
- Good for scheduled demos

#### 4. Database Alternatives for Demo:

**Option A: Use SQLite (FREE)**

- Embed SQLite in your app container
- Perfect for demos with sample data
- Zero database costs

**Option B: Use RDS Free Tier**

- db.t2.micro (20GB storage free for 12 months)
- Only for AWS accounts < 12 months old

### Quick Cost Comparison:

| Component         | Production | Demo (Current) | Demo (Spot) | Demo (Fargate) |
| ----------------- | ---------- | -------------- | ----------- | -------------- |
| EKS Control Plane | $75        | $75            | $75         | $75            |
| Compute           | $60        | $9             | $3          | $0\*           |
| Load Balancer     | $20        | $20            | $20         | $20            |
| Storage/CDN       | $7         | $6             | $6          | $6             |
| **Total/month**   | **$162**   | **$110**       | **$104**    | **$101\***     |

\*Fargate charges only when pods are running

### Demo-Specific Terraform Configuration:

Create a `demo.tfvars` file:

```hcl
# Demo environment - cost optimized
project_name = "hotel-demo"
environment  = "demo"

# Minimal compute
node_instance_types   = ["t3.micro"]
node_desired_capacity = 1
node_max_capacity     = 2
node_min_capacity     = 1

# Use spot instances for 70% savings
node_capacity_type = "SPOT"

# Minimal database
db_instance_class    = "db.t3.micro"
db_allocated_storage = 10

# Demo tags
tags = {
  Environment = "demo"
  Purpose     = "demonstration"
  AutoShutdown = "true"  # For automation scripts
}
```

### Usage for Demo:

```bash
# Deploy with demo config
terraform apply -var-file="demo.tfvars"

# Quick demo setup (30 seconds)
./deploy.sh plan

# Destroy after demo
./deploy.sh destroy
```

### Free Tier Eligible Components:

- **S3**: 5GB free storage + 20,000 GET requests
- **CloudFront**: 1TB data transfer + 10M requests
- **ECR**: 500MB storage free
- **CloudWatch**: Basic monitoring free

### Monitoring Demo Costs:

1. Set up AWS Cost Alerts for $50/month
2. Use AWS Cost Explorer to track daily costs
3. Enable detailed billing reports

### Emergency Cost Control:

```bash
# Immediate shutdown
terraform destroy -auto-approve

# Or scale down to zero
kubectl scale deployment/backend --replicas=0 -n hotel-management-system-app
```

### When to Upgrade:

- **Demo → Development**: Add monitoring, increase storage
- **Development → Production**: Add redundancy, security, monitoring
- **Production**: Multi-region, backup strategies, enterprise features

Remember: This configuration is optimized for demo/development. For production use, restore higher resource allocations for reliability and performance.
