output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = module.vpc.public_subnet_ids
}

output "ecr_repository_urls" {
  description = "URLs of ECR repositories"
  value       = module.ecr.repository_urls
}

output "ecs_cluster_name" {
  description = "Name of ECS cluster"
  value       = module.ecs.cluster_name
}

output "ecs_cluster_arn" {
  description = "ARN of ECS cluster"
  value       = module.ecs.cluster_arn
}

output "frontend_service_name" {
  description = "Name of frontend ECS service"
  value       = module.ecs.frontend_service_name
}

output "user_service_name" {
  description = "Name of user service ECS service"
  value       = module.ecs.user_service_name
}

output "course_service_name" {
  description = "Name of course service ECS service"
  value       = module.ecs.course_service_name
}

output "frontend_url" {
  description = "URL to access frontend application"
  value       = module.ecs.frontend_url
}

output "user_service_url" {
  description = "URL to access user service"
  value       = module.ecs.user_service_url
}

output "course_service_url" {
  description = "URL to access course service"
  value       = module.ecs.course_service_url
}

output "sns_topic_arn" {
  description = "ARN of SNS topic for alarms"
  value       = module.sns.topic_arn
}

output "cloudwatch_log_groups" {
  description = "CloudWatch log group names"
  value       = module.ecs.log_group_names
}
