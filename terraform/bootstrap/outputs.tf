output "state_bucket" {
  description = "Bucket name for the s3 backend in terraform/backend.tf"
  value       = aws_s3_bucket.state.id
}

output "lock_table" {
  description = "DynamoDB table name for the s3 backend in terraform/backend.tf"
  value       = aws_dynamodb_table.locks.name
}

output "kms_key_arn" {
  description = "KMS key that encrypts state; set it as kms_key_id in terraform/backend.tf"
  value       = aws_kms_key.state.arn
}
