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
