output "vpc_id" {
  description = "ID of the VPC"
  value       = data.aws_vpc.main.id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = data.aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = data.aws_subnets.public.ids
}

output "internet_gateway_id" {
  description = "ID of Internet Gateway"
  value       = data.aws_internet_gateway.main.id
}

output "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  value       = aws_security_group.ecs_tasks.id
}

output "alb_security_group_id" {
  description = "Security group ID for ALB"
  value       = aws_security_group.alb.id
}
