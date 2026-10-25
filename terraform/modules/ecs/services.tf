# Task definitions and Fargate services for the three containers.

# Task Definitions
resource "aws_ecs_task_definition" "frontend" {
  #checkov:skip=CKV_AWS_336:Next.js writes its cache under .next at runtime; the API containers are read-only
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
      { name = "GOOGLE_CLIENT_ID", value = var.google_client_id }
    ]

    secrets = [
      { name = "NEXTAUTH_SECRET", valueFrom = local.secret_arns["nextauth-secret"] },
      { name = "GOOGLE_CLIENT_SECRET", valueFrom = local.secret_arns["google-client-secret"] },
      { name = "ANALYTICS_API_KEY", valueFrom = local.secret_arns["analytics-api-key"] }
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

    # The service only reads its own code and logs to stdout, so nothing in the container may change.
    readonlyRootFilesystem = true

    portMappings = [{
      containerPort = 5000
      protocol      = "tcp"
    }]

    environment = [
      { name = "PORT", value = "5000" },
      { name = "NODE_ENV", value = "production" },
      { name = "FRONTEND_URL", value = "http://${aws_lb.main.dns_name}" },
      { name = "GOOGLE_CLIENT_ID", value = var.google_client_id },
      { name = "ADMIN_EMAILS", value = join(",", var.admin_emails) }
    ]

    secrets = [
      { name = "DATABASE_URL", valueFrom = local.secret_arns["database-url"] },
      { name = "JWT_SECRET", valueFrom = local.secret_arns["jwt-secret"] },
      { name = "JWT_REFRESH_SECRET", valueFrom = local.secret_arns["jwt-refresh-secret"] },
      { name = "ANALYTICS_API_KEY", valueFrom = local.secret_arns["analytics-api-key"] }
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

    # The service only reads its own code and logs to stdout, so nothing in the container may change.
    readonlyRootFilesystem = true

    portMappings = [{
      containerPort = 5001
      protocol      = "tcp"
    }]

    environment = [
      { name = "PORT", value = "5001" },
      { name = "NODE_ENV", value = "production" },
      { name = "FRONTEND_URL", value = "http://${aws_lb.main.dns_name}" }
    ]

    secrets = [
      { name = "DATABASE_URL", valueFrom = local.secret_arns["database-url"] },
      { name = "JWT_SECRET", valueFrom = local.secret_arns["jwt-secret"] }
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
  #checkov:skip=CKV_AWS_333:Tasks run in the default VPC public subnets without a NAT gateway and need a public IP to pull images
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
    ignore_changes = [task_definition, desired_count]
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-frontend-service"
    Service = "frontend"
  }
}

resource "aws_ecs_service" "user_service" {
  #checkov:skip=CKV_AWS_333:Tasks run in the default VPC public subnets without a NAT gateway and need a public IP to pull images
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
    ignore_changes = [task_definition, desired_count, load_balancer]
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-user-service"
    Service = "user-service"
  }
}

resource "aws_ecs_service" "course_service" {
  #checkov:skip=CKV_AWS_333:Tasks run in the default VPC public subnets without a NAT gateway and need a public IP to pull images
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
    ignore_changes = [task_definition, desired_count, load_balancer]
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-course-service"
    Service = "course-service"
  }
}
