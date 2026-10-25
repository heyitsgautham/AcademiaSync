# Checks the alarms in the cloudwatch module.

mock_provider "aws" {
  source = "./tests/mocks"
}

variables {
  project_name     = "academiasync"
  environment      = "prod"
  ecs_cluster_name = "academiasync-prod-cluster"
  ecs_services = {
    frontend       = "academiasync-prod-frontend"
    user_service   = "academiasync-prod-user-service"
    course_service = "academiasync-prod-course-service"
  }
  sns_topic_arn    = "arn:aws:sns:us-east-1:123456789012:alarms"
  alb_arn_suffix   = "app/academiasync-prod-alb/0123456789abcdef"
  target_group_arn_suffixes = {
    frontend       = "targetgroup/frontend/1111"
    user_service   = "targetgroup/user/2222"
    course_service = "targetgroup/course/3333"
  }
  cpu_threshold    = 75
  memory_threshold = 85
}

run "one_cpu_and_one_memory_alarm_per_service" {
  command = plan

  module {
    source = "./modules/cloudwatch"
  }

  # These are the names the hand-written alarms had, so the moved blocks plan no replacement.
  assert {
    condition = toset([for a in aws_cloudwatch_metric_alarm.service_utilization : a.alarm_name]) == toset([
      "academiasync-prod-frontend-cpu-high",
      "academiasync-prod-user-service-cpu-high",
      "academiasync-prod-course-service-cpu-high",
      "academiasync-prod-frontend-memory-high",
      "academiasync-prod-user-service-memory-high",
      "academiasync-prod-course-service-memory-high",
    ])
    error_message = "Alarm names changed, which would replace the existing alarms."
  }

  assert {
    condition     = aws_cloudwatch_metric_alarm.service_utilization["user-service-cpu"].alarm_description == "Alert when user service CPU utilization exceeds 75%"
    error_message = "Descriptions should keep the wording of the original alarms."
  }

  assert {
    condition     = aws_cloudwatch_metric_alarm.service_utilization["course-service-memory"].threshold == 85 && aws_cloudwatch_metric_alarm.service_utilization["course-service-memory"].metric_name == "MemoryUtilization"
    error_message = "Memory alarms should use memory_threshold and the MemoryUtilization metric."
  }

  assert {
    condition     = aws_cloudwatch_metric_alarm.service_utilization["frontend-cpu"].dimensions.ServiceName == "academiasync-prod-frontend"
    error_message = "Each alarm should watch its own service."
  }

  assert {
    condition     = alltrue([for a in aws_cloudwatch_metric_alarm.service_utilization : a.alarm_actions == toset(["arn:aws:sns:us-east-1:123456789012:alarms"])])
    error_message = "Every alarm should notify the SNS topic."
  }
}

run "load_balancer_alarms" {
  command = plan

  module {
    source = "./modules/cloudwatch"
  }

  variables {
    http_5xx_threshold = 25
  }

  assert {
    condition     = aws_cloudwatch_metric_alarm.alb_5xx.metric_name == "HTTPCode_ELB_5XX_Count" && aws_cloudwatch_metric_alarm.alb_5xx.threshold == 25
    error_message = "The load balancer 5xx alarm should count ELB 5xx responses against http_5xx_threshold."
  }

  assert {
    condition     = aws_cloudwatch_metric_alarm.frontend_5xx.dimensions.TargetGroup == "targetgroup/frontend/1111"
    error_message = "The frontend 5xx alarm should watch the frontend target group."
  }

  assert {
    condition     = aws_cloudwatch_metric_alarm.unhealthy_targets["course-service"].dimensions.TargetGroup == "targetgroup/course/3333"
    error_message = "Each unhealthy-target alarm should watch its own target group."
  }

  assert {
    condition     = alltrue([for a in aws_cloudwatch_metric_alarm.unhealthy_targets : a.threshold == 0 && a.statistic == "Maximum"])
    error_message = "One unhealthy target is enough to alarm."
  }

  assert {
    condition     = length(output.alarm_names) == 11
    error_message = "Six utilization, two 5xx and three health alarms are expected."
  }
}

run "rejects_a_zero_5xx_threshold" {
  command = plan

  module {
    source = "./modules/cloudwatch"
  }

  variables {
    http_5xx_threshold = 0
  }

  expect_failures = [var.http_5xx_threshold]
}
