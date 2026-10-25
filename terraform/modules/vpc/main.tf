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
}

# Security Group for Load Balancer
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-${var.environment}-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = data.aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-${var.environment}-alb-sg"
  }
}

# Every rule lives in code, one resource per rule, so a plan shows any drift.
# Groups created before this change carry hand-made rules; see terraform/README.md before applying.

locals {
  # frontend, user-service, course-service
  container_ports = toset(["3000", "5000", "5001"])
  # Ports the frontend calls through Cloud Map
  backend_ports = toset(["5000", "5001"])
}

# The load balancer is the public entry point and listens on plain HTTP until the stack has a certificate.
#trivy:ignore:AWS-0107
resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  security_group_id = aws_security_group.alb.id
  description       = "HTTP from the internet"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
  cidr_ipv4         = "0.0.0.0/0"
}

# The load balancer forwards to the frontend and health-checks all three target groups.
resource "aws_vpc_security_group_egress_rule" "alb_to_tasks" {
  for_each = local.container_ports

  security_group_id            = aws_security_group.alb.id
  description                  = "Forward and health-check port ${each.value} on the ECS tasks"
  ip_protocol                  = "tcp"
  from_port                    = tonumber(each.value)
  to_port                      = tonumber(each.value)
  referenced_security_group_id = aws_security_group.ecs_tasks.id
}

resource "aws_vpc_security_group_ingress_rule" "tasks_from_alb" {
  for_each = local.container_ports

  security_group_id            = aws_security_group.ecs_tasks.id
  description                  = "Port ${each.value} from the load balancer"
  ip_protocol                  = "tcp"
  from_port                    = tonumber(each.value)
  to_port                      = tonumber(each.value)
  referenced_security_group_id = aws_security_group.alb.id
}

resource "aws_vpc_security_group_ingress_rule" "tasks_from_tasks" {
  for_each = local.backend_ports

  security_group_id            = aws_security_group.ecs_tasks.id
  description                  = "Frontend server calls to port ${each.value} over Cloud Map"
  ip_protocol                  = "tcp"
  from_port                    = tonumber(each.value)
  to_port                      = tonumber(each.value)
  referenced_security_group_id = aws_security_group.ecs_tasks.id
}

resource "aws_vpc_security_group_egress_rule" "tasks_to_tasks" {
  for_each = local.backend_ports

  security_group_id            = aws_security_group.ecs_tasks.id
  description                  = "Frontend server calls to port ${each.value} over Cloud Map"
  ip_protocol                  = "tcp"
  from_port                    = tonumber(each.value)
  to_port                      = tonumber(each.value)
  referenced_security_group_id = aws_security_group.ecs_tasks.id
}

# Tasks pull images from ECR and verify Google sign-in tokens over HTTPS. The tasks run in
# public subnets without a NAT gateway or VPC endpoints, so those calls go to public addresses.
#trivy:ignore:AWS-0104
resource "aws_vpc_security_group_egress_rule" "tasks_https" {
  security_group_id = aws_security_group.ecs_tasks.id
  description       = "HTTPS to ECR, CloudWatch Logs, SSM and Google"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
  cidr_ipv4         = "0.0.0.0/0"
}

# The database is hosted outside this VPC (Supabase or another managed Postgres).
#trivy:ignore:AWS-0104
resource "aws_vpc_security_group_egress_rule" "tasks_database" {
  security_group_id = aws_security_group.ecs_tasks.id
  description       = "PostgreSQL to the hosted database"
  ip_protocol       = "tcp"
  from_port         = var.database_port
  to_port           = var.database_port
  cidr_ipv4         = "0.0.0.0/0"
}
