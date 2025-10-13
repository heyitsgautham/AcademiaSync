# AcademiaSync AWS Infrastructure
# This configuration deploys the complete application stack to AWS
terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC Module - Uses Default VPC
module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
}

# ECR Module - Creates Docker image repositories
module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
  repositories = var.ecr_repositories
}

# SNS Module - Creates notification topic for CloudWatch alarms
module "sns" {
  source = "./modules/sns"

  project_name = var.project_name
  environment  = var.environment
  alert_email  = var.alert_email
}

# ECS Module - Creates ECS cluster and Fargate services
module "ecs" {
  source = "./modules/ecs"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  public_subnet_ids     = module.vpc.public_subnet_ids
  alb_security_group_id = module.vpc.alb_security_group_id
  ecs_security_group_id = module.vpc.ecs_security_group_id

  # Container configuration
  frontend_image       = var.frontend_image
  user_service_image   = var.user_service_image
  course_service_image = var.course_service_image

  # Task sizing (Free Tier compatible)
  frontend_cpu          = var.frontend_cpu
  frontend_memory       = var.frontend_memory
  user_service_cpu      = var.user_service_cpu
  user_service_memory   = var.user_service_memory
  course_service_cpu    = var.course_service_cpu
  course_service_memory = var.course_service_memory

  # Environment variables
  nextauth_secret      = var.nextauth_secret
  nextauth_url         = var.nextauth_url
  google_client_id     = var.google_client_id
  google_client_secret = var.google_client_secret
  jwt_secret           = var.jwt_secret
  jwt_refresh_secret   = var.jwt_refresh_secret
  database_url         = var.database_url
}

# CloudWatch Module - Creates monitoring and alarms
module "cloudwatch" {
  source = "./modules/cloudwatch"

  project_name     = var.project_name
  environment      = var.environment
  ecs_cluster_name = module.ecs.cluster_name
  ecs_services     = module.ecs.service_names
  sns_topic_arn    = module.sns.topic_arn

  # Alarm thresholds
  cpu_threshold    = var.cpu_alarm_threshold
  memory_threshold = var.memory_alarm_threshold
}
