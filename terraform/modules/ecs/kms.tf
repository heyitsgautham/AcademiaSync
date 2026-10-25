# One customer-managed key for the data this stack holds: the SSM secrets and the container logs.
# Unlike the AWS-managed keys, its policy is in code and its use shows up per key in CloudTrail.

data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "app_key" {
  # The account keeps full control, which lets IAM policies such as the execution role's grant use of the key.
  statement {
    sid       = "AccountAdministers"
    actions   = ["kms:*"]
    resources = ["*"]

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
  }

  # CloudWatch Logs encrypts this stack's log groups and nothing else with the key.
  statement {
    sid = "CloudWatchLogsUse"
    actions = [
      "kms:Encrypt*",
      "kms:Decrypt*",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:Describe*",
    ]
    resources = ["*"]

    principals {
      type        = "Service"
      identifiers = ["logs.${data.aws_region.current.name}.amazonaws.com"]
    }

    condition {
      test     = "ArnLike"
      variable = "kms:EncryptionContext:aws:logs:arn"
      values   = ["arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/ecs/${var.project_name}-${var.environment}/*"]
    }
  }
}

resource "aws_kms_key" "app" {
  description             = "Encrypts ${var.project_name}-${var.environment} secrets in SSM and its ECS container logs"
  enable_key_rotation     = true
  deletion_window_in_days = 30
  policy                  = data.aws_iam_policy_document.app_key.json

  tags = {
    Name = "${var.project_name}-${var.environment}-app-key"
  }
}

resource "aws_kms_alias" "app" {
  name          = "alias/${var.project_name}-${var.environment}-app"
  target_key_id = aws_kms_key.app.key_id
}
