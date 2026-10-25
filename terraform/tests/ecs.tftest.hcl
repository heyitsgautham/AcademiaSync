# Checks the ECS module: which settings each container gets and how secrets reach it.

mock_provider "aws" {
  source = "./tests/mocks"
}

variables {
  project_name          = "academiasync"
  environment           = "prod"
  vpc_id                = "vpc-0123456789abcdef0"
  public_subnet_ids     = ["subnet-0123456789abcdef0", "subnet-0fedcba9876543210"]
  alb_security_group_id = "sg-0aaaaaaaaaaaaaaaa"
  ecs_security_group_id = "sg-0bbbbbbbbbbbbbbbb"
  frontend_image        = "frontend:test"
  user_service_image    = "user-service:test"
  course_service_image  = "course-service:test"
  frontend_cpu          = 256
  frontend_memory       = 512
  user_service_cpu      = 256
  user_service_memory   = 512
  course_service_cpu    = 256
  course_service_memory = 512
  nextauth_secret       = "test-nextauth-secret"
  google_client_id      = "test-client.apps.googleusercontent.com"
  google_client_secret  = "test-google-secret"
  jwt_secret            = "test-jwt-secret"
  jwt_refresh_secret    = "test-jwt-refresh-secret"
  database_url          = "postgresql://app:pw@db.example.com:5432/academiasync"
  analytics_api_key     = "test-analytics-key"
  admin_emails          = ["owner@example.com", "second@example.com"]
}

run "secrets_come_from_parameter_store" {
  module {
    source = "./modules/ecs"
  }

  assert {
    condition     = length(aws_ssm_parameter.secrets) == 6
    error_message = "Every application secret should have its own parameter."
  }

  assert {
    condition     = alltrue([for p in aws_ssm_parameter.secrets : p.type == "SecureString"])
    error_message = "Secrets must be stored as SecureString so they are encrypted at rest."
  }

  assert {
    condition     = alltrue([for p in aws_ssm_parameter.secrets : startswith(p.name, "/academiasync/prod/")])
    error_message = "Parameters should sit under /<project>/<environment>/."
  }

  assert {
    condition = alltrue([
      for td in [aws_ecs_task_definition.frontend, aws_ecs_task_definition.user_service, aws_ecs_task_definition.course_service] :
      length(regexall("test-(nextauth|google|jwt|analytics)|app:pw@", td.container_definitions)) == 0
    ])
    error_message = "No secret value may appear in a task definition."
  }
}

run "each_service_gets_only_the_secrets_it_reads" {
  module {
    source = "./modules/ecs"
  }

  assert {
    condition = toset([for s in jsondecode(aws_ecs_task_definition.frontend.container_definitions)[0].secrets : s.name]) == toset([
      "NEXTAUTH_SECRET", "GOOGLE_CLIENT_SECRET", "ANALYTICS_API_KEY",
    ])
    error_message = "The frontend reads the NextAuth secret, the Google client secret and the analytics key."
  }

  assert {
    condition = toset([for s in jsondecode(aws_ecs_task_definition.user_service.container_definitions)[0].secrets : s.name]) == toset([
      "DATABASE_URL", "JWT_SECRET", "JWT_REFRESH_SECRET", "ANALYTICS_API_KEY",
    ])
    error_message = "user-service reads the database URL, both JWT secrets and the analytics key."
  }

  assert {
    condition = toset([for s in jsondecode(aws_ecs_task_definition.course_service.container_definitions)[0].secrets : s.name]) == toset([
      "DATABASE_URL", "JWT_SECRET",
    ])
    error_message = "course-service only verifies access tokens, so it gets no refresh secret."
  }

  assert {
    condition = contains(
      jsondecode(aws_ecs_task_definition.user_service.container_definitions)[0].environment,
      { name = "ADMIN_EMAILS", value = "owner@example.com,second@example.com" }
    )
    error_message = "user-service should receive ADMIN_EMAILS as a comma-separated list."
  }
}

run "execution_role_reads_only_the_app_parameters" {
  module {
    source = "./modules/ecs"
  }

  assert {
    condition     = aws_iam_role_policy.ecs_task_execution_secrets.role == aws_iam_role.ecs_task_execution.id
    error_message = "The secrets policy belongs on the execution role, which ECS uses to start tasks."
  }

  assert {
    condition     = data.aws_iam_policy_document.read_secrets.statement[0].actions == toset(["ssm:GetParameters"])
    error_message = "The execution role should only be able to read parameters."
  }

  assert {
    condition     = length(data.aws_iam_policy_document.read_secrets.statement[0].resources) == 6
    error_message = "The execution role may read the six app parameters and nothing else."
  }

  assert {
    condition     = data.aws_iam_policy_document.read_secrets.statement[1].actions == toset(["kms:Decrypt"]) && data.aws_iam_policy_document.read_secrets.statement[1].resources == toset([aws_kms_key.app.arn])
    error_message = "The execution role may decrypt with the app key only."
  }
}

run "secrets_and_logs_use_the_app_key" {
  module {
    source = "./modules/ecs"
  }

  assert {
    condition     = aws_kms_key.app.enable_key_rotation
    error_message = "The app key should rotate yearly."
  }

  assert {
    condition     = alltrue([for p in aws_ssm_parameter.secrets : p.key_id == aws_kms_key.app.arn])
    error_message = "Every secret should be encrypted with the app key."
  }

  assert {
    condition = alltrue([
      for g in [aws_cloudwatch_log_group.frontend, aws_cloudwatch_log_group.user_service, aws_cloudwatch_log_group.course_service] :
      g.kms_key_id == aws_kms_key.app.arn
    ])
    error_message = "Every container log group should be encrypted with the app key."
  }

  assert {
    condition     = toset(one(data.aws_iam_policy_document.app_key.statement[1].condition).values) == toset(["arn:aws:logs:us-east-1:123456789012:log-group:/ecs/academiasync-prod/*"])
    error_message = "CloudWatch Logs may use the key only for this stack's log groups."
  }
}

run "container_insights_follows_the_variable" {
  command = plan

  module {
    source = "./modules/ecs"
  }

  assert {
    condition     = one([for s in aws_ecs_cluster.main.setting : s.value if s.name == "containerInsights"]) == "enabled"
    error_message = "Container Insights should be on by default."
  }
}

run "container_insights_can_be_turned_off" {
  command = plan

  module {
    source = "./modules/ecs"
  }

  variables {
    container_insights = false
  }

  assert {
    condition     = one([for s in aws_ecs_cluster.main.setting : s.value if s.name == "containerInsights"]) == "disabled"
    error_message = "container_insights = false should disable Container Insights."
  }
}

run "prod_load_balancer_names_are_unchanged" {
  command = plan

  module {
    source = "./modules/ecs"
  }

  assert {
    condition = [aws_lb.main.name, aws_lb_target_group.frontend.name, aws_lb_target_group.user_service.name, aws_lb_target_group.course_service.name] == [
      "academiasync-prod-alb", "academiasync-prod-frontend-tg", "academiasync-prod-user-svc-tg", "academiasync-prod-course-svc-tg",
    ]
    error_message = "Renaming the prod load balancer or a target group would replace it."
  }
}

run "staging_names_fit_the_32_character_limit" {
  command = plan

  module {
    source = "./modules/ecs"
  }

  variables {
    environment = "staging"
  }

  assert {
    condition = alltrue([
      for name in [aws_lb.main.name, aws_lb_target_group.frontend.name, aws_lb_target_group.user_service.name, aws_lb_target_group.course_service.name] :
      length(name) <= 32 && !endswith(name, "-")
    ])
    error_message = "Load balancer and target group names must be at most 32 characters and must not end in a hyphen."
  }

  assert {
    condition     = aws_lb_target_group.course_service.name == "academiasync-staging-course-svc"
    error_message = "The course-service target group name should be cut to 32 characters without the trailing hyphen."
  }
}

run "api_containers_have_read_only_root_filesystems" {
  command = plan

  module {
    source = "./modules/ecs"
  }

  assert {
    condition = alltrue([
      jsondecode(aws_ecs_task_definition.user_service.container_definitions)[0].readonlyRootFilesystem,
      jsondecode(aws_ecs_task_definition.course_service.container_definitions)[0].readonlyRootFilesystem,
    ])
    error_message = "user-service and course-service never write to disk, so their root filesystems should be read-only."
  }
}
