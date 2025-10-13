output "cluster_name" {
  description = "Name of ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "cluster_arn" {
  description = "ARN of ECS cluster"
  value       = aws_ecs_cluster.main.arn
}

output "service_names" {
  description = "Names of ECS services"
  value = {
    frontend       = aws_ecs_service.frontend.name
    user_service   = aws_ecs_service.user_service.name
    course_service = aws_ecs_service.course_service.name
  }
}

output "frontend_service_name" {
  description = "Name of frontend ECS service"
  value       = aws_ecs_service.frontend.name
}

output "user_service_name" {
  description = "Name of user service ECS service"
  value       = aws_ecs_service.user_service.name
}

output "course_service_name" {
  description = "Name of course service ECS service"
  value       = aws_ecs_service.course_service.name
}

output "frontend_url" {
  description = "URL to access frontend application"
  value       = "http://${aws_lb.main.dns_name}"
}

output "user_service_url" {
  description = "URL to access user service"
  value       = "http://${aws_lb.main.dns_name}"
}

output "course_service_url" {
  description = "URL to access course service"
  value       = "http://${aws_lb.main.dns_name}"
}

output "alb_dns_name" {
  description = "DNS name of Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "log_group_names" {
  description = "CloudWatch log group names"
  value = {
    frontend       = aws_cloudwatch_log_group.frontend.name
    user_service   = aws_cloudwatch_log_group.user_service.name
    course_service = aws_cloudwatch_log_group.course_service.name
  }
}
