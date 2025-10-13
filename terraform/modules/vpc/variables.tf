variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

# Note: vpc_cidr, availability_zones, and public_subnet_cidrs are no longer needed
# as we're using the default VPC with existing subnets

