# ec2-free-tier.tf (Alternative to EKS for FREE deployment)
# This creates an EC2-based deployment that's completely FREE under AWS Free Tier

# Create this as a separate configuration for free tier deployment

# EC2 Instance for backend (FREE - t3.micro)
resource "aws_instance" "backend_free_tier" {
  count = var.environment == "campus" ? 1 : 0

  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.micro"  # FREE tier eligible
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.backend_free_tier[0].id]
  
  associate_public_ip_address = true
  
  user_data = base64encode(templatefile("${path.module}/templates/backend-userdata.sh", {
    db_host     = aws_db_instance.postgres_free_tier[0].endpoint
    db_port     = aws_db_instance.postgres_free_tier[0].port
    db_name     = var.db_name
    db_user     = var.db_username
    db_password = random_password.db_password.result
  }))

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-backend"
    Type = "free-tier-backend"
  })
}

# Security Group for EC2 Backend
resource "aws_security_group" "backend_free_tier" {
  count = var.environment == "campus" ? 1 : 0
  
  name_prefix = "${var.project_name}-${var.environment}-backend-"
  vpc_id      = aws_vpc.main.id

  # HTTP access
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # SSH access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Restrict this to your IP in production
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-backend-sg"
  })
}

# RDS Instance (FREE - db.t3.micro)
resource "aws_db_instance" "postgres_free_tier" {
  count = var.environment == "campus" ? 1 : 0

  identifier = "${var.project_name}-${var.environment}-db"
  
  engine                = "postgres"
  engine_version        = "15.4"
  instance_class        = "db.t3.micro"  # FREE tier eligible
  allocated_storage     = 20             # FREE tier max
  max_allocated_storage = 20             # Prevent auto-scaling costs
  
  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_password.result
  
  # Free tier optimizations
  storage_type      = "gp2"              # FREE tier storage type
  storage_encrypted = false              # Encryption costs extra
  
  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.free_tier[0].name
  vpc_security_group_ids = [aws_security_group.db_free_tier[0].id]
  publicly_accessible    = false
  
  # Backup settings (minimal for free tier)
  backup_retention_period = 0           # No backups to save costs
  backup_window          = null
  maintenance_window     = "sun:03:00-sun:04:00"
  
  # Disable features that cost money
  monitoring_interval = 0
  deletion_protection = false
  skip_final_snapshot = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-database"
    Type = "free-tier-database"
  })
}

# DB Subnet Group
resource "aws_db_subnet_group" "free_tier" {
  count = var.environment == "campus" ? 1 : 0
  
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  })
}

# Security Group for RDS
resource "aws_security_group" "db_free_tier" {
  count = var.environment == "campus" ? 1 : 0
  
  name_prefix = "${var.project_name}-${var.environment}-db-"
  vpc_id      = aws_vpc.main.id

  # PostgreSQL access from backend
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.backend_free_tier[0].id]
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-database-sg"
  })
}

# Get Amazon Linux 2 AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Outputs for free tier deployment
output "free_tier_backend_ip" {
  description = "Public IP of the backend EC2 instance"
  value       = var.environment == "campus" ? aws_instance.backend_free_tier[0].public_ip : null
}

output "free_tier_backend_dns" {
  description = "Public DNS of the backend EC2 instance"
  value       = var.environment == "campus" ? aws_instance.backend_free_tier[0].public_dns : null
}

output "free_tier_database_endpoint" {
  description = "RDS instance endpoint"
  value       = var.environment == "campus" ? aws_db_instance.postgres_free_tier[0].endpoint : null
  sensitive   = true
}