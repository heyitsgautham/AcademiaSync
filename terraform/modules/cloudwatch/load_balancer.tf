# Alarms on what users see through the load balancer: server errors and unhealthy targets.

# 5xx responses the load balancer generated itself, such as 502 and 503 when no healthy target answers.
resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name          = "${var.project_name}-${var.environment}-alb-5xx"
  alarm_description   = "Load balancer returned more than ${var.http_5xx_threshold} 5xx responses in 5 minutes"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_ELB_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = var.http_5xx_threshold
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  alarm_actions = [var.sns_topic_arn]
  ok_actions    = [var.sns_topic_arn]

  tags = {
    Name = "${var.project_name}-${var.environment}-alb-5xx-alarm"
  }
}

# 5xx responses from the frontend containers, which serve every page and API route.
resource "aws_cloudwatch_metric_alarm" "frontend_5xx" {
  alarm_name          = "${var.project_name}-${var.environment}-frontend-5xx"
  alarm_description   = "Frontend returned more than ${var.http_5xx_threshold} 5xx responses in 5 minutes"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = var.http_5xx_threshold
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.target_group_arn_suffixes.frontend
  }

  alarm_actions = [var.sns_topic_arn]
  ok_actions    = [var.sns_topic_arn]

  tags = {
    Name    = "${var.project_name}-${var.environment}-frontend-5xx-alarm"
    Service = "frontend"
  }
}

# A target that fails its health check, for example /health returning 503 when a service loses the database.
resource "aws_cloudwatch_metric_alarm" "unhealthy_targets" {
  for_each = local.services

  alarm_name          = "${var.project_name}-${var.environment}-${each.key}-unhealthy-targets"
  alarm_description   = "At least one ${each.value.label} task is failing its load balancer health check"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Maximum"
  threshold           = 0
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.target_group_arn_suffixes[replace(each.key, "-", "_")]
  }

  alarm_actions = [var.sns_topic_arn]
  ok_actions    = [var.sns_topic_arn]

  tags = {
    Name    = "${var.project_name}-${var.environment}-${each.key}-unhealthy-targets-alarm"
    Service = each.key
  }
}
