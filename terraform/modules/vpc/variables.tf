variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "database_port" {
  description = "TCP port of the hosted PostgreSQL database the tasks connect to"
  type        = number
  default     = 5432

  validation {
    condition     = var.database_port > 0 && var.database_port < 65536
    error_message = "database_port must be a TCP port between 1 and 65535."
  }
}

