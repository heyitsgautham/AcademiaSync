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
    condition = output.alarm_names == sort([
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
