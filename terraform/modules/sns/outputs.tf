output "topic_arn" {
  description = "ARN of SNS topic for CloudWatch alarms"
  value       = aws_sns_topic.cloudwatch_alarms.arn
}

output "topic_name" {
  description = "Name of SNS topic"
  value       = aws_sns_topic.cloudwatch_alarms.name
}

output "subscription_arn" {
  description = "ARN of email subscription"
  value       = aws_sns_topic_subscription.email.arn
}
