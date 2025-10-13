# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"

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
  name              = "/ecs/${var.project_name}-${var.environment}/frontend"
  retention_in_days = 7 # Free tier: 7 days retention

  lifecycle {
    ignore_changes = [name]
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-frontend-logs"
    Service = "frontend"
  }
}

resource "aws_cloudwatch_log_group" "user_service" {
  name              = "/ecs/${var.project_name}-${var.environment}/user-service"
  retention_in_days = 7

  lifecycle {
    ignore_changes = [name]
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-user-service-logs"
    Service = "user-service"
  }
}

resource "aws_cloudwatch_log_group" "course_service" {
  name              = "/ecs/${var.project_name}-${var.environment}/course-service"
  retention_in_days = 7

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

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = false

  tags = {
    Name = "${var.project_name}-${var.environment}-alb"
  }
}

# Target Groups
resource "aws_lb_target_group" "frontend" {
  name        = "${var.project_name}-${var.environment}-frontend-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 5
    timeout             = 30
    interval            = 60
    path                = "/"
    matcher             = "200"
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-frontend-tg"
    Service = "frontend"
  }
}

resource "aws_lb_target_group" "user_service" {
  name        = "${var.project_name}-${var.environment}-user-svc-tg"
  port        = 5000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-user-service-tg"
    Service = "user-service"
  }
}

resource "aws_lb_target_group" "course_service" {
  name        = "${var.project_name}-${var.environment}-course-svc-tg"
  port        = 5001
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-course-service-tg"
    Service = "course-service"
  }
}

# ALB Listener - Route traffic to frontend
resource "aws_lb_listener" "frontend" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# NOTE: Frontend acts as API gateway and proxies to backend services internally
# No need for ALB listener rules to route /api/* paths to backend services
# All traffic goes to frontend, which handles routing via Next.js API routes

# # Listener Rules for API routing - COMMENTED OUT (not needed)
# resource "aws_lb_listener_rule" "user_service" {
#   listener_arn = aws_lb_listener.frontend.arn
#   priority     = 100
#
#   action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.user_service.arn
#   }
#
#   condition {
#     path_pattern {
#       values = ["/api/auth/*", "/api/users/*", "/health"]
#     }
#   }
# }
#
# resource "aws_lb_listener_rule" "course_service" {
#   listener_arn = aws_lb_listener.frontend.arn
#   priority     = 101
#
#   action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.course_service.arn
#   }
#
#   condition {
#     path_pattern {
#       values = ["/api/courses/*", "/api/assignments/*", "/api/enrollments/*", "/api/submissions/*"]
#     }
#   }
# }

# Task Definitions
resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.project_name}-${var.environment}-frontend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.frontend_cpu
  memory                   = var.frontend_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name  = "frontend"
    image = var.frontend_image

    portMappings = [{
      containerPort = 3000
      protocol      = "tcp"
    }]

    environment = [
      { name = "NEXTAUTH_URL", value = "http://${aws_lb.main.dns_name}" },
      { name = "NEXT_PUBLIC_BACKEND_URL", value = "http://${aws_lb.main.dns_name}" },
      { name = "INTERNAL_BACKEND_URL", value = "http://user-service.${aws_service_discovery_private_dns_namespace.main.name}:5000" },
      { name = "NEXT_PUBLIC_COURSE_SERVICE_URL", value = "http://${aws_lb.main.dns_name}" },
      { name = "INTERNAL_COURSE_SERVICE_URL", value = "http://course-service.${aws_service_discovery_private_dns_namespace.main.name}:5001" },
      { name = "NEXTAUTH_SECRET", value = var.nextauth_secret },
      { name = "GOOGLE_CLIENT_ID", value = var.google_client_id },
      { name = "GOOGLE_CLIENT_SECRET", value = var.google_client_secret }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.frontend.name
        "awslogs-region"        = data.aws_region.current.name
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])

  tags = {
    Name    = "${var.project_name}-${var.environment}-frontend-task"
    Service = "frontend"
  }
}

resource "aws_ecs_task_definition" "user_service" {
  family                   = "${var.project_name}-${var.environment}-user-service"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.user_service_cpu
  memory                   = var.user_service_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name  = "user-service"
    image = var.user_service_image

    portMappings = [{
      containerPort = 5000
      protocol      = "tcp"
    }]

    environment = [
      { name = "PORT", value = "5000" },
      { name = "NODE_ENV", value = "production" },
      { name = "FRONTEND_URL", value = "http://${aws_lb.main.dns_name}" },
      { name = "DATABASE_URL", value = var.database_url },
      { name = "JWT_SECRET", value = var.jwt_secret },
      { name = "JWT_REFRESH_SECRET", value = var.jwt_refresh_secret },
      { name = "GOOGLE_CLIENT_ID", value = var.google_client_id },
      { name = "GOOGLE_CLIENT_SECRET", value = var.google_client_secret }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.user_service.name
        "awslogs-region"        = data.aws_region.current.name
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])

  tags = {
    Name    = "${var.project_name}-${var.environment}-user-service-task"
    Service = "user-service"
  }
}

resource "aws_ecs_task_definition" "course_service" {
  family                   = "${var.project_name}-${var.environment}-course-service"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.course_service_cpu
  memory                   = var.course_service_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name  = "course-service"
    image = var.course_service_image

    portMappings = [{
      containerPort = 5001
      protocol      = "tcp"
    }]

    environment = [
      { name = "PORT", value = "5001" },
      { name = "NODE_ENV", value = "production" },
      { name = "FRONTEND_URL", value = "http://${aws_lb.main.dns_name}" },
      { name = "DATABASE_URL", value = var.database_url },
      { name = "JWT_SECRET", value = var.jwt_secret },
      { name = "JWT_REFRESH_SECRET", value = var.jwt_refresh_secret }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.course_service.name
        "awslogs-region"        = data.aws_region.current.name
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])

  tags = {
    Name    = "${var.project_name}-${var.environment}-course-service-task"
    Service = "course-service"
  }
}

# ECS Services
resource "aws_ecs_service" "frontend" {
  name            = "${var.project_name}-${var.environment}-frontend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.public_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.frontend]

  lifecycle {
    ignore_changes = [desired_count]
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-frontend-service"
    Service = "frontend"
  }
}

resource "aws_ecs_service" "user_service" {
  name            = "${var.project_name}-${var.environment}-user-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.user_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.public_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.user_service.arn
    container_name   = "user-service"
    container_port   = 5000
  }

  service_registries {
    registry_arn = aws_service_discovery_service.user_service.arn
  }

  depends_on = [aws_lb_listener.frontend]

  lifecycle {
    ignore_changes = [desired_count, load_balancer]
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-user-service"
    Service = "user-service"
  }
}

resource "aws_ecs_service" "course_service" {
  name            = "${var.project_name}-${var.environment}-course-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.course_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.public_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.course_service.arn
    container_name   = "course-service"
    container_port   = 5001
  }

  service_registries {
    registry_arn = aws_service_discovery_service.course_service.arn
  }

  depends_on = [aws_lb_listener.frontend]

  lifecycle {
    ignore_changes = [desired_count, load_balancer]
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-course-service"
    Service = "course-service"
  }
}

# Data source for current AWS region
data "aws_region" "current" {}
