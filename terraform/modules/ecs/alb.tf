# Load balancer in front of the frontend service.
# Resources keep their original addresses, so moving them between files changes no state.

# Application Load Balancer
# This is the public entry point for the web app, so it has to face the internet.
#trivy:ignore:AWS-0053
resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  # Reject requests with malformed headers instead of forwarding them to the containers
  drop_invalid_header_fields = true

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
# The stack has no domain or ACM certificate, so the ALB serves plain HTTP on its AWS hostname.
# Add an HTTPS listener with a certificate before using this for real accounts.
#trivy:ignore:AWS-0054
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
