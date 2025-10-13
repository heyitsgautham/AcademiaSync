variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where ECS resources will be created"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for ECS tasks"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "Security group ID for ALB"
  type        = string
}

variable "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

# Container Images
variable "frontend_image" {
  description = "Docker image for frontend service"
  type        = string
}

variable "user_service_image" {
  description = "Docker image for user service"
  type        = string
}

variable "course_service_image" {
  description = "Docker image for course service"
  type        = string
}

# Task Sizing
variable "frontend_cpu" {
  description = "CPU units for frontend task"
  type        = number
}

variable "frontend_memory" {
  description = "Memory for frontend task in MB"
  type        = number
}

variable "user_service_cpu" {
  description = "CPU units for user service task"
  type        = number
}

variable "user_service_memory" {
  description = "Memory for user service task in MB"
  type        = number
}

variable "course_service_cpu" {
  description = "CPU units for course service task"
  type        = number
}

variable "course_service_memory" {
  description = "Memory for course service task in MB"
  type        = number
}

# Application Environment Variables
variable "nextauth_secret" {
  description = "NextAuth secret key"
  type        = string
  sensitive   = true
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
  description = "Database connection URL"
  type        = string
  sensitive   = true
}
