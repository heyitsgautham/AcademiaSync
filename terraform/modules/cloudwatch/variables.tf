variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "ecs_cluster_name" {
  description = "Name of ECS cluster to monitor"
  type        = string
}

variable "ecs_services" {
  description = "Map of ECS service names"
  type = object({
    frontend       = string
    user_service   = string
    course_service = string
  })
}

variable "sns_topic_arn" {
  description = "ARN of SNS topic for alarm notifications"
  type        = string
}

variable "cpu_threshold" {
  description = "CPU utilization threshold for alarms (%)"
  type        = number
  default     = 80
}

variable "memory_threshold" {
  description = "Memory utilization threshold for alarms (%)"
  type        = number
  default     = 80
}

variable "alb_arn_suffix" {
  description = "ARN suffix of the load balancer to watch"
  type        = string
}

variable "target_group_arn_suffixes" {
  description = "ARN suffix of each service's target group"
  type = object({
    frontend       = string
    user_service   = string
    course_service = string
  })
}

variable "http_5xx_threshold" {
  description = "5xx responses in five minutes, from the load balancer or the frontend, that raise an alarm"
  type        = number
  default     = 10

  validation {
    condition     = var.http_5xx_threshold >= 1
    error_message = "http_5xx_threshold must be at least 1."
  }
}
