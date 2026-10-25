# Checks the state bucket and lock table against a mocked AWS provider.

mock_provider "aws" {
  mock_resource "aws_kms_key" {
    defaults = {
      arn    = "arn:aws:kms:us-east-1:123456789012:key/0e1d2c3b-4a59-6877-8695-a4b3c2d1e0f9"
      key_id = "0e1d2c3b-4a59-6877-8695-a4b3c2d1e0f9"
    }
  }

  mock_resource "aws_s3_bucket" {
    defaults = {
      arn = "arn:aws:s3:::academiasync-tf-state-test"
      id  = "academiasync-tf-state-test"
    }
  }

  mock_data "aws_caller_identity" {
    defaults = {
      account_id = "123456789012"
    }
  }

  mock_data "aws_iam_policy_document" {
    defaults = {
      json = "{\"Version\":\"2012-10-17\",\"Statement\":[]}"
    }
  }
}

variables {
  state_bucket_name = "academiasync-tf-state-test"
}

run "state_is_private_versioned_and_encrypted" {
  assert {
    condition     = aws_s3_bucket_versioning.state.versioning_configuration[0].status == "Enabled"
    error_message = "Versioning lets a bad apply be rolled back to the previous state."
  }

  assert {
    condition = alltrue([
      aws_s3_bucket_public_access_block.state.block_public_acls,
      aws_s3_bucket_public_access_block.state.block_public_policy,
      aws_s3_bucket_public_access_block.state.ignore_public_acls,
      aws_s3_bucket_public_access_block.state.restrict_public_buckets,
    ])
    error_message = "State holds secrets, so every public access path must be blocked."
  }

  assert {
    condition     = one([for r in aws_s3_bucket_server_side_encryption_configuration.state.rule : one(r.apply_server_side_encryption_by_default).kms_master_key_id]) == aws_kms_key.state.arn
    error_message = "State objects should be encrypted with the state KMS key."
  }

  assert {
    condition     = aws_kms_key.state.enable_key_rotation
    error_message = "The state key should rotate."
  }

  assert {
    condition     = aws_s3_bucket.state.force_destroy == false
    error_message = "Destroy must not empty a bucket that holds state."
  }
}

run "bucket_policy_refuses_plain_http" {
  assert {
    condition     = data.aws_iam_policy_document.state_bucket.statement[0].effect == "Deny" && one(data.aws_iam_policy_document.state_bucket.statement[0].condition).variable == "aws:SecureTransport"
    error_message = "Requests without TLS must be denied."
  }
}

run "lock_table_is_encrypted_and_recoverable" {
  assert {
    condition     = aws_dynamodb_table.locks.hash_key == "LockID"
    error_message = "The s3 backend expects a LockID hash key."
  }

  assert {
    condition     = aws_dynamodb_table.locks.server_side_encryption[0].kms_key_arn == aws_kms_key.state.arn
    error_message = "The lock table should use the state key."
  }

  assert {
    condition     = aws_dynamodb_table.locks.point_in_time_recovery[0].enabled
    error_message = "Point-in-time recovery should be on."
  }
}

run "rejects_an_invalid_bucket_name" {
  command = plan

  variables {
    state_bucket_name = "AcademiaSync_State"
  }

  expect_failures = [var.state_bucket_name]
}
