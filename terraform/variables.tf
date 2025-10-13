variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "academiasync"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

# ECR Configuration
variable "ecr_repositories" {
  description = "List of ECR repository names"
  type        = list(string)
  default     = ["frontend", "user-service", "course-service"]
}

# SNS Configuration
variable "alert_email" {
  description = "Email address for CloudWatch alarm notifications"
  type        = string
  sensitive   = true
}

# ECS Container Images (will be updated after first push to ECR)
variable "frontend_image" {
  description = "Docker image for frontend service"
  type        = string
  default     = "nginx:alpine" # Placeholder, will be replaced with ECR image
}

variable "user_service_image" {
  description = "Docker image for user service"
  type        = string
  default     = "nginx:alpine" # Placeholder, will be replaced with ECR image
}

variable "course_service_image" {
  description = "Docker image for course service"
  type        = string
  default     = "nginx:alpine" # Placeholder, will be replaced with ECR image
}

# ECS Task Sizing (Free Tier: 512 CPU, 1024 MB = 0.5 vCPU, 1 GB)
variable "frontend_cpu" {
  description = "CPU units for frontend task (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory for frontend task in MB"
  type        = number
  default     = 512
}

variable "user_service_cpu" {
  description = "CPU units for user service task"
  type        = number
  default     = 256
}

variable "user_service_memory" {
  description = "Memory for user service task in MB"
  type        = number
  default     = 512
}

variable "course_service_cpu" {
  description = "CPU units for course service task"
  type        = number
  default     = 256
}

variable "course_service_memory" {
  description = "Memory for course service task in MB"
  type        = number
  default     = 512
}

# Application Environment Variables (Secrets should be passed via CI/CD)
variable "nextauth_secret" {
  description = "NextAuth secret key"
  type        = string
  sensitive   = true
}

variable "nextauth_url" {
  description = "NextAuth URL"
  type        = string
}

variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "jwt_refresh_secret" {
  description = "JWT refresh secret key"
  type        = string
  sensitive   = true
}

variable "database_url" {
  description = "Database connection URL (Supabase or RDS)"
  type        = string
  sensitive   = true
}

# CloudWatch Alarm Thresholds
variable "cpu_alarm_threshold" {
  description = "CPU utilization threshold for alarms (%)"
  type        = number
  default     = 80
}

variable "memory_alarm_threshold" {
  description = "Memory utilization threshold for alarms (%)"
  type        = number
  default     = 80
}
