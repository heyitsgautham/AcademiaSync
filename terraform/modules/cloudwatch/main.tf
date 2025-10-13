# CPU Utilization Alarms
resource "aws_cloudwatch_metric_alarm" "frontend_cpu_high" {
  alarm_name          = "${var.project_name}-${var.environment}-frontend-cpu-high"
  alarm_description   = "Alert when frontend CPU utilization exceeds ${var.cpu_threshold}%"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300 # 5 minutes
  statistic           = "Average"
  threshold           = var.cpu_threshold
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_services.frontend
  }

  alarm_actions = [var.sns_topic_arn]
  ok_actions    = [var.sns_topic_arn]

  tags = {
    Name    = "${var.project_name}-${var.environment}-frontend-cpu-alarm"
    Service = "frontend"
  }
}

resource "aws_cloudwatch_metric_alarm" "user_service_cpu_high" {
  alarm_name          = "${var.project_name}-${var.environment}-user-service-cpu-high"
  alarm_description   = "Alert when user service CPU utilization exceeds ${var.cpu_threshold}%"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = var.cpu_threshold
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_services.user_service
  }

  alarm_actions = [var.sns_topic_arn]
  ok_actions    = [var.sns_topic_arn]

  tags = {
    Name    = "${var.project_name}-${var.environment}-user-service-cpu-alarm"
    Service = "user-service"
  }
}

resource "aws_cloudwatch_metric_alarm" "course_service_cpu_high" {
  alarm_name          = "${var.project_name}-${var.environment}-course-service-cpu-high"
  alarm_description   = "Alert when course service CPU utilization exceeds ${var.cpu_threshold}%"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = var.cpu_threshold
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_services.course_service
  }

  alarm_actions = [var.sns_topic_arn]
  ok_actions    = [var.sns_topic_arn]

  tags = {
    Name    = "${var.project_name}-${var.environment}-course-service-cpu-alarm"
    Service = "course-service"
  }
}

# Memory Utilization Alarms
resource "aws_cloudwatch_metric_alarm" "frontend_memory_high" {
  alarm_name          = "${var.project_name}-${var.environment}-frontend-memory-high"
  alarm_description   = "Alert when frontend memory utilization exceeds ${var.memory_threshold}%"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = var.memory_threshold
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_services.frontend
  }

  alarm_actions = [var.sns_topic_arn]
  ok_actions    = [var.sns_topic_arn]

  tags = {
    Name    = "${var.project_name}-${var.environment}-frontend-memory-alarm"
    Service = "frontend"
  }
}

resource "aws_cloudwatch_metric_alarm" "user_service_memory_high" {
  alarm_name          = "${var.project_name}-${var.environment}-user-service-memory-high"
  alarm_description   = "Alert when user service memory utilization exceeds ${var.memory_threshold}%"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = var.memory_threshold
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_services.user_service
  }

  alarm_actions = [var.sns_topic_arn]
  ok_actions    = [var.sns_topic_arn]

  tags = {
    Name    = "${var.project_name}-${var.environment}-user-service-memory-alarm"
    Service = "user-service"
  }
}

resource "aws_cloudwatch_metric_alarm" "course_service_memory_high" {
  alarm_name          = "${var.project_name}-${var.environment}-course-service-memory-high"
  alarm_description   = "Alert when course service memory utilization exceeds ${var.memory_threshold}%"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = var.memory_threshold
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_services.course_service
  }

  alarm_actions = [var.sns_topic_arn]
  ok_actions    = [var.sns_topic_arn]

  tags = {
    Name    = "${var.project_name}-${var.environment}-course-service-memory-alarm"
    Service = "course-service"
  }
}
