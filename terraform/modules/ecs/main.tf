# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"

  # Per-task CPU, memory, network and restart metrics in CloudWatch
  setting {
    name  = "containerInsights"
    value = var.container_insights ? "enabled" : "disabled"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cluster"
  }
}

# AWS Cloud Map Namespace for Service Discovery
resource "aws_service_discovery_private_dns_namespace" "main" {
  name        = "${var.project_name}-${var.environment}.local"
  description = "Private DNS namespace for ${var.project_name} services"
  vpc         = var.vpc_id

  tags = {
    Name = "${var.project_name}-${var.environment}-namespace"
  }

  lifecycle {
    ignore_changes = [name, vpc]
  }
}

# Service Discovery for User Service
resource "aws_service_discovery_service" "user_service" {
  name = "user-service"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-user-service-discovery"
    Service = "user-service"
  }
}

# Service Discovery for Course Service
resource "aws_service_discovery_service" "course_service" {
  name = "course-service"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-course-service-discovery"
    Service = "course-service"
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "frontend" {
  #checkov:skip=CKV_AWS_338:Seven-day retention keeps log storage inside the free tier
  name              = "/ecs/${var.project_name}-${var.environment}/frontend"
  retention_in_days = 7 # Free tier: 7 days retention
  kms_key_id        = aws_kms_key.app.arn

  lifecycle {
    ignore_changes = [name]
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-frontend-logs"
    Service = "frontend"
  }
}

resource "aws_cloudwatch_log_group" "user_service" {
  #checkov:skip=CKV_AWS_338:Seven-day retention keeps log storage inside the free tier
  name              = "/ecs/${var.project_name}-${var.environment}/user-service"
  retention_in_days = 7
  kms_key_id        = aws_kms_key.app.arn

  lifecycle {
    ignore_changes = [name]
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-user-service-logs"
    Service = "user-service"
  }
}

resource "aws_cloudwatch_log_group" "course_service" {
  #checkov:skip=CKV_AWS_338:Seven-day retention keeps log storage inside the free tier
  name              = "/ecs/${var.project_name}-${var.environment}/course-service"
  retention_in_days = 7
  kms_key_id        = aws_kms_key.app.arn

  lifecycle {
    ignore_changes = [name]
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-course-service-logs"
    Service = "course-service"
  }
}

# IAM Role for ECS Task Execution
resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.project_name}-${var.environment}-ecs-task-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })

  lifecycle {
    ignore_changes = [name]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-task-execution"
  }
}

# Attach AWS managed policy for ECS task execution
resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAM Role for ECS Tasks (application runtime)
resource "aws_iam_role" "ecs_task" {
  name = "${var.project_name}-${var.environment}-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })

  lifecycle {
    ignore_changes = [name]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-task"
  }
}


# Data source for current AWS region
data "aws_region" "current" {}
