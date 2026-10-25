# Application secrets live in SSM Parameter Store as SecureString parameters, encrypted with the stack's key.
# Task definitions reference them by ARN, so the values never appear in a task definition,
# the ECS console or `aws ecs describe-task-definition` output. ECS fetches them at task start
# with the execution role, which may read these parameters and nothing else.

locals {
  # Names are static so they can drive for_each; the values stay sensitive.
  secret_names = toset([
    "analytics-api-key",
    "database-url",
    "google-client-secret",
    "jwt-refresh-secret",
    "jwt-secret",
    "nextauth-secret",
  ])

  secret_values = {
    "analytics-api-key"    = var.analytics_api_key
    "database-url"         = var.database_url
    "google-client-secret" = var.google_client_secret
    "jwt-refresh-secret"   = var.jwt_refresh_secret
    "jwt-secret"           = var.jwt_secret
    "nextauth-secret"      = var.nextauth_secret
  }

  secret_arns = { for name, param in aws_ssm_parameter.secrets : name => param.arn }
}

resource "aws_ssm_parameter" "secrets" {
  for_each = local.secret_names

  name        = "/${var.project_name}/${var.environment}/${each.key}"
  description = "AcademiaSync ${each.key}, injected into ECS tasks as an environment variable"
  type        = "SecureString"
  key_id      = aws_kms_key.app.arn
  value       = local.secret_values[each.key]

  tags = {
    Name = "${var.project_name}-${var.environment}-${each.key}"
  }
}

data "aws_iam_policy_document" "read_secrets" {
  statement {
    sid       = "ReadAppSecrets"
    actions   = ["ssm:GetParameters"]
    resources = values(local.secret_arns)
  }

  statement {
    sid       = "DecryptAppSecrets"
    actions   = ["kms:Decrypt"]
    resources = [aws_kms_key.app.arn]
  }
}

resource "aws_iam_role_policy" "ecs_task_execution_secrets" {
  name   = "${var.project_name}-${var.environment}-read-app-secrets"
  role   = aws_iam_role.ecs_task_execution.id
  policy = data.aws_iam_policy_document.read_secrets.json
}
