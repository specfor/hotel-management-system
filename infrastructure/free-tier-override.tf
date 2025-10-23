# free-tier-override.tf
# Special configurations for AWS Free Tier campus projects
# This file overrides certain configurations to stay within free tier limits

locals {
  # Free tier specific configurations
  is_free_tier = var.environment == "campus" || var.environment == "student"
  
  # Override instance types for free tier
  free_tier_node_types = ["t3.micro"]  # 750 hours/month free
  free_tier_db_class   = "db.t3.micro" # 750 hours/month free
  
  # Single AZ configuration for cost optimization
  free_tier_azs            = ["us-east-1a"]
  free_tier_public_subnets = ["10.0.101.0/24"]
  free_tier_private_subnets = ["10.0.1.0/24"]
}

# Free tier warnings and recommendations
output "free_tier_warning" {
  value = <<-EOT
    ⚠️  IMPORTANT: AWS Free Tier Considerations
    
    📊 Current Monthly Costs (Estimated):
    - EKS Cluster: ~$73/month (NOT covered by free tier)
    - NAT Gateway: ~$45/month (NOT covered by free tier)  
    - EC2 t3.micro: FREE (750 hours/month)
    - RDS t3.micro: FREE (750 hours/month)
    - S3 Storage: FREE (5GB)
    - CloudFront: FREE (50GB/month)
    
    💡 Free Tier Alternatives:
    1. Use EC2 + Docker Compose instead of EKS
    2. Use single AZ with Internet Gateway only (no NAT)
    3. Deploy to EC2 with public IP
    
    🎓 For Campus Project:
    - Total monthly cost: ~$118 (EKS + NAT Gateway)
    - Consider: EC2-only deployment for $0/month
  EOT
}

output "free_tier_recommendations" {
  value = <<-EOT
    🎓 Campus Project Recommendations:
    
    Option 1: Current Architecture (EKS)
    - Cost: ~$118/month
    - Features: Full Kubernetes, Load Balancer, Auto-scaling
    - Best for: Learning Kubernetes, Production-like environment
    
    Option 2: EC2 + Docker (FREE)
    - Cost: $0/month (within free tier)
    - Features: Docker containers, Manual scaling
    - Best for: Campus projects, Cost-conscious learning
    
    To switch to FREE Option 2:
    1. Set environment = "campus" in terraform.tfvars
    2. Use the alternative EC2 deployment scripts
    3. Deploy frontend to S3 + CloudFront (FREE)
  EOT
}