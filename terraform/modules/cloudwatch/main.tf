# CPU and memory alarms for each ECS service, built from one definition.
# Names, descriptions and tags match the six hand-written alarms they replaced,
# and the moved blocks below carry their state over, so the refactor plans no changes.

locals {
  services = {
    "frontend" = {
      service_name = var.ecs_services.frontend
      label        = "frontend"
    }
    "user-service" = {
      service_name = var.ecs_services.user_service
      label        = "user service"
    }
    "course-service" = {
      service_name = var.ecs_services.course_service
      label        = "course service"
    }
  }

  utilization = {
    cpu = {
      metric    = "CPUUtilization"
      label     = "CPU"
      threshold = var.cpu_threshold
    }
    memory = {
      metric    = "MemoryUtilization"
      label     = "memory"
      threshold = var.memory_threshold
    }
  }

  service_alarms = {
    for pair in setproduct(keys(local.services), keys(local.utilization)) :
    "${pair[0]}-${pair[1]}" => {
      service = pair[0]
      kind    = pair[1]
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "service_utilization" {
  for_each = local.service_alarms

  alarm_name          = "${var.project_name}-${var.environment}-${each.value.service}-${each.value.kind}-high"
  alarm_description   = "Alert when ${local.services[each.value.service].label} ${local.utilization[each.value.kind].label} utilization exceeds ${local.utilization[each.value.kind].threshold}%"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = local.utilization[each.value.kind].metric
  namespace           = "AWS/ECS"
  period              = 300 # 5 minutes
  statistic           = "Average"
  threshold           = local.utilization[each.value.kind].threshold
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = local.services[each.value.service].service_name
  }

  alarm_actions = [var.sns_topic_arn]
  ok_actions    = [var.sns_topic_arn]

  tags = {
    Name    = "${var.project_name}-${var.environment}-${each.value.service}-${each.value.kind}-alarm"
    Service = each.value.service
  }
}

moved {
  from = aws_cloudwatch_metric_alarm.frontend_cpu_high
  to   = aws_cloudwatch_metric_alarm.service_utilization["frontend-cpu"]
}

moved {
  from = aws_cloudwatch_metric_alarm.user_service_cpu_high
  to   = aws_cloudwatch_metric_alarm.service_utilization["user-service-cpu"]
}

moved {
  from = aws_cloudwatch_metric_alarm.course_service_cpu_high
  to   = aws_cloudwatch_metric_alarm.service_utilization["course-service-cpu"]
}

moved {
  from = aws_cloudwatch_metric_alarm.frontend_memory_high
  to   = aws_cloudwatch_metric_alarm.service_utilization["frontend-memory"]
}

moved {
  from = aws_cloudwatch_metric_alarm.user_service_memory_high
  to   = aws_cloudwatch_metric_alarm.service_utilization["user-service-memory"]
}

moved {
  from = aws_cloudwatch_metric_alarm.course_service_memory_high
  to   = aws_cloudwatch_metric_alarm.service_utilization["course-service-memory"]
}
