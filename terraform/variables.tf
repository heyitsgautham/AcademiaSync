variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "academiasync"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{1,20}$", var.project_name))
    error_message = "project_name must be 2 to 21 lowercase letters, digits or hyphens, starting with a letter, because it prefixes resource names with length limits."
  }
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be dev, staging or prod."
  }
}

variable "database_port" {
  description = "TCP port of the hosted PostgreSQL database, 6543 for the Supabase pooler"
  type        = number
  default     = 5432
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

  validation {
    condition     = can(regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", var.alert_email))
    error_message = "alert_email must be an email address."
  }
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

  validation {
    condition     = contains([256, 512, 1024, 2048, 4096], var.frontend_cpu)
    error_message = "frontend_cpu must be a Fargate CPU size: 256, 512, 1024, 2048 or 4096."
  }
}

variable "frontend_memory" {
  description = "Memory for frontend task in MB"
  type        = number
  default     = 512

  validation {
    condition     = var.frontend_memory >= 512 && var.frontend_memory <= 30720
    error_message = "frontend_memory must be between 512 and 30720 MB, the range Fargate accepts."
  }
}

variable "user_service_cpu" {
  description = "CPU units for user service task"
  type        = number
  default     = 256

  validation {
    condition     = contains([256, 512, 1024, 2048, 4096], var.user_service_cpu)
    error_message = "user_service_cpu must be a Fargate CPU size: 256, 512, 1024, 2048 or 4096."
  }
}

variable "user_service_memory" {
  description = "Memory for user service task in MB"
  type        = number
  default     = 512

  validation {
    condition     = var.user_service_memory >= 512 && var.user_service_memory <= 30720
    error_message = "user_service_memory must be between 512 and 30720 MB, the range Fargate accepts."
  }
}

variable "course_service_cpu" {
  description = "CPU units for course service task"
  type        = number
  default     = 256

  validation {
    condition     = contains([256, 512, 1024, 2048, 4096], var.course_service_cpu)
    error_message = "course_service_cpu must be a Fargate CPU size: 256, 512, 1024, 2048 or 4096."
  }
}

variable "course_service_memory" {
  description = "Memory for course service task in MB"
  type        = number
  default     = 512

  validation {
    condition     = var.course_service_memory >= 512 && var.course_service_memory <= 30720
    error_message = "course_service_memory must be between 512 and 30720 MB, the range Fargate accepts."
  }
}

# Application Environment Variables (Secrets should be passed via CI/CD)
variable "nextauth_secret" {
  description = "NextAuth secret key"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.nextauth_secret) >= 32
    error_message = "nextauth_secret must be at least 32 characters. Generate one with: openssl rand -base64 32"
  }
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

  validation {
    condition     = length(var.jwt_secret) >= 32
    error_message = "jwt_secret must be at least 32 characters. Generate one with: openssl rand -base64 32"
  }
}

variable "jwt_refresh_secret" {
  description = "JWT refresh secret key"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.jwt_refresh_secret) >= 32
    error_message = "jwt_refresh_secret must be at least 32 characters. Generate one with: openssl rand -base64 32"
  }
}

variable "database_url" {
  description = "Database connection URL (Supabase or RDS)"
  type        = string
  sensitive   = true

  validation {
    condition     = can(regex("^postgres(ql)?://", var.database_url))
    error_message = "database_url must be a postgres:// or postgresql:// connection string."
  }
}

variable "analytics_api_key" {
  description = "Key that unlocks GET /admin/analytics, shared by the frontend and user-service"
  type        = string
  sensitive   = true
}

variable "admin_emails" {
  description = "Google accounts that become Admin when they sign in"
  type        = list(string)
  default     = []

  validation {
    condition     = alltrue([for email in var.admin_emails : can(regex("^[^@\\s,]+@[^@\\s,]+\\.[^@\\s,]+$", email))])
    error_message = "admin_emails must hold email addresses, one per list item."
  }
}

variable "container_insights" {
  description = "Turn on CloudWatch Container Insights for the ECS cluster"
  type        = bool
  default     = true
}

# CloudWatch Alarm Thresholds
variable "cpu_alarm_threshold" {
  description = "CPU utilization threshold for alarms (%)"
  type        = number
  default     = 80

  validation {
    condition     = var.cpu_alarm_threshold > 0 && var.cpu_alarm_threshold <= 100
    error_message = "cpu_alarm_threshold is a percentage between 1 and 100."
  }
}

variable "memory_alarm_threshold" {
  description = "Memory utilization threshold for alarms (%)"
  type        = number
  default     = 80

  validation {
    condition     = var.memory_alarm_threshold > 0 && var.memory_alarm_threshold <= 100
    error_message = "memory_alarm_threshold is a percentage between 1 and 100."
  }
}
