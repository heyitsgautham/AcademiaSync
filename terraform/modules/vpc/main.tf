# Use Default VPC instead of creating a custom VPC
data "aws_vpc" "main" {
  default = true
}

# Get the default Internet Gateway
data "aws_internet_gateway" "main" {
  filter {
    name   = "attachment.vpc-id"
    values = [data.aws_vpc.main.id]
  }
}

# Get all public subnets in the default VPC
data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }

  # Filter for subnets with public IPs enabled
  filter {
    name   = "map-public-ip-on-launch"
    values = ["true"]
  }
}

# Security Group for ECS Tasks
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.project_name}-${var.environment}-ecs-tasks-sg"
  description = "Security group for ECS tasks"
  vpc_id      = data.aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-tasks-sg"
  }

  lifecycle {
    ignore_changes = [ingress, egress]
  }
}

# Security Group for Load Balancer
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-${var.environment}-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = data.aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-${var.environment}-alb-sg"
  }

  lifecycle {
    ignore_changes = [ingress, egress]
  }
}

# Ingress rule for ALB (allow HTTP from anywhere)
# NOTE: Security Group rules are managed on the imported Security Groups themselves
# These rule resources are commented out to prevent "duplicate rule" errors
# The imported Security Groups already have all necessary rules configured

# resource "aws_security_group_rule" "alb_http" {
#   type              = "ingress"
#   from_port         = 80
#   to_port           = 80
#   protocol          = "tcp"
#   cidr_blocks       = ["0.0.0.0/0"]
#   security_group_id = aws_security_group.alb.id
#   description       = "Allow HTTP traffic"
# }

# resource "aws_security_group_rule" "alb_https" {
#   type              = "ingress"
#   from_port         = 443
#   to_port           = 443
#   protocol          = "tcp"
#   cidr_blocks       = ["0.0.0.0/0"]
#   security_group_id = aws_security_group.alb.id
#   description       = "Allow HTTPS traffic"
# }

# resource "aws_security_group_rule" "ecs_from_alb" {
#   type                     = "ingress"
#   from_port                = 0
#   to_port                  = 65535
#   protocol                 = "tcp"
#   source_security_group_id = aws_security_group.alb.id
#   security_group_id        = aws_security_group.ecs_tasks.id
#   description              = "Allow traffic from ALB"
# }

# resource "aws_security_group_rule" "ecs_self_reference" {
#   type                     = "ingress"
#   from_port                = 0
#   to_port                  = 65535
#   protocol                 = "tcp"
#   source_security_group_id = aws_security_group.ecs_tasks.id
#   security_group_id        = aws_security_group.ecs_tasks.id
#   description              = "Allow ECS tasks to communicate with each other"
# }

