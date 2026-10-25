# CloudWatch alarms cannot publish to a topic encrypted with the AWS managed aws/sns key,
# and the topic only carries alarm state changes, so it stays unencrypted.
#trivy:ignore:AWS-0095
resource "aws_sns_topic" "cloudwatch_alarms" {
  #checkov:skip=CKV_AWS_26:CloudWatch alarms cannot publish to a topic encrypted with aws/sns, and the topic carries only alarm state changes
  name = "${var.project_name}-${var.environment}-cloudwatch-alarms"

  tags = {
    Name = "${var.project_name}-${var.environment}-cloudwatch-alarms"
  }
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.cloudwatch_alarms.arn
  protocol  = "email"
  endpoint  = var.alert_email
}
