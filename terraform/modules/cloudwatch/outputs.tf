output "cpu_alarm_arns" {
  description = "ARNs of CPU utilization alarms"
  value = {
    frontend       = aws_cloudwatch_metric_alarm.service_utilization["frontend-cpu"].arn
    user_service   = aws_cloudwatch_metric_alarm.service_utilization["user-service-cpu"].arn
    course_service = aws_cloudwatch_metric_alarm.service_utilization["course-service-cpu"].arn
  }
}

output "memory_alarm_arns" {
  description = "ARNs of memory utilization alarms"
  value = {
    frontend       = aws_cloudwatch_metric_alarm.service_utilization["frontend-memory"].arn
    user_service   = aws_cloudwatch_metric_alarm.service_utilization["user-service-memory"].arn
    course_service = aws_cloudwatch_metric_alarm.service_utilization["course-service-memory"].arn
  }
}

output "alarm_names" {
  description = "Names of all CloudWatch alarms"
  value = sort(concat(
    [for alarm in aws_cloudwatch_metric_alarm.service_utilization : alarm.alarm_name],
    [aws_cloudwatch_metric_alarm.alb_5xx.alarm_name, aws_cloudwatch_metric_alarm.frontend_5xx.alarm_name],
    [for alarm in aws_cloudwatch_metric_alarm.unhealthy_targets : alarm.alarm_name],
  ))
}
