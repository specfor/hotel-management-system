# variables.tf

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "hotel-management-system"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "availability_zones" {
  description = "Availability zones (single AZ for free tier optimization)"
  type        = list(string)
  default     = ["us-east-1a"]  # Single AZ to minimize costs
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "private_subnets" {
  description = "Private subnet CIDR blocks (single subnet for free tier)"
  type        = list(string)
  default     = ["10.0.1.0/24"]  # Single private subnet
}

variable "public_subnets" {
  description = "Public subnet CIDR blocks (single subnet for free tier)"
  type        = list(string)
  default     = ["10.0.101.0/24"]  # Single public subnet
}

variable "node_instance_types" {
  description = "EC2 instance types for EKS worker nodes (free tier eligible)"
  type        = list(string)
  default     = ["t3.micro"]  # Free tier eligible: 750 hours/month
}

variable "node_desired_capacity" {
  description = "Desired number of worker nodes (free tier: 1 node)"
  type        = number
  default     = 1  # Single node for free tier
}

variable "node_max_capacity" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = 1  # Keep at 1 for free tier
}

variable "node_min_capacity" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 1
}

variable "db_instance_class" {
  description = "RDS instance class (free tier: db.t3.micro or db.t4g.micro)"
  type        = string
  default     = "db.t3.micro"  # Free tier: 750 hours/month
}

variable "db_allocated_storage" {
  description = "RDS allocated storage (free tier: up to 20GB)"
  type        = number
  default     = 20  # Max free tier storage
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "hotelmanagement"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "postgres"
}

variable "domain_name" {
  description = "Domain name for the application (optional)"
  type        = string
  default     = ""
}

variable "enable_logging" {
  description = "Enable CloudWatch logging"
  type        = bool
  default     = true
}

variable "node_capacity_type" {
  description = "Type of capacity (SPOT for cost savings, ON_DEMAND for free tier)"
  type        = string
  default     = "ON_DEMAND"  # Use ON_DEMAND for free tier eligibility
}

variable "kubernetes_version" {
  description = "Kubernetes version for the EKS cluster"
  type        = string
  default     = "1.30"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project   = "hotel-management-system"
    ManagedBy = "terraform"
  }
}