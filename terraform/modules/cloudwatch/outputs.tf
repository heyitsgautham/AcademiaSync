output "cpu_alarm_arns" {
  description = "ARNs of CPU utilization alarms"
  value = {
    frontend       = aws_cloudwatch_metric_alarm.frontend_cpu_high.arn
    user_service   = aws_cloudwatch_metric_alarm.user_service_cpu_high.arn
    course_service = aws_cloudwatch_metric_alarm.course_service_cpu_high.arn
  }
}

output "memory_alarm_arns" {
  description = "ARNs of memory utilization alarms"
  value = {
    frontend       = aws_cloudwatch_metric_alarm.frontend_memory_high.arn
    user_service   = aws_cloudwatch_metric_alarm.user_service_memory_high.arn
    course_service = aws_cloudwatch_metric_alarm.course_service_memory_high.arn
  }
}

output "alarm_names" {
  description = "Names of all CloudWatch alarms"
  value = [
    aws_cloudwatch_metric_alarm.frontend_cpu_high.alarm_name,
    aws_cloudwatch_metric_alarm.user_service_cpu_high.alarm_name,
    aws_cloudwatch_metric_alarm.course_service_cpu_high.alarm_name,
    aws_cloudwatch_metric_alarm.frontend_memory_high.alarm_name,
    aws_cloudwatch_metric_alarm.user_service_memory_high.alarm_name,
    aws_cloudwatch_metric_alarm.course_service_memory_high.alarm_name,
  ]
}
