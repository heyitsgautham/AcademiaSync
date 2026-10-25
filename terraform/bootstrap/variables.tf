variable "aws_region" {
  description = "Region for the state bucket and lock table"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used in tags and the key alias"
  type        = string
  default     = "academiasync"
}

variable "state_bucket_name" {
  description = "Globally unique name for the state bucket"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$", var.state_bucket_name))
    error_message = "state_bucket_name must be a valid S3 bucket name: 3 to 63 lowercase letters, digits, dots or hyphens."
  }
}

variable "lock_table_name" {
  description = "Name of the DynamoDB table Terraform locks state with"
  type        = string
  default     = "academiasync-terraform-locks"
}

variable "noncurrent_version_days" {
  description = "Days to keep a replaced state version before it expires"
  type        = number
  default     = 90

  validation {
    condition     = var.noncurrent_version_days >= 1
    error_message = "noncurrent_version_days must be at least 1."
  }
}
