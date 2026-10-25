# Values the mocked AWS provider returns in `terraform test`.
# Generated ARNs are random strings that the provider rejects, so each ARN gets a valid shape.

mock_data "aws_vpc" {
  defaults = {
    id         = "vpc-0123456789abcdef0"
    cidr_block = "172.31.0.0/16"
  }
}

mock_data "aws_subnets" {
  defaults = {
    ids = ["subnet-0123456789abcdef0", "subnet-0fedcba9876543210"]
  }
}

mock_data "aws_region" {
  defaults = {
    name = "us-east-1"
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

mock_resource "aws_iam_role" {
  defaults = {
    arn = "arn:aws:iam::123456789012:role/mock-role"
  }
}

mock_resource "aws_lb" {
  defaults = {
    arn      = "arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/mock/0123456789abcdef"
    dns_name = "mock-alb-123456789.us-east-1.elb.amazonaws.com"
  }
}

mock_resource "aws_lb_target_group" {
  defaults = {
    arn = "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/mock/0123456789abcdef"
  }
}

mock_resource "aws_sns_topic" {
  defaults = {
    arn = "arn:aws:sns:us-east-1:123456789012:mock-topic"
  }
}

mock_resource "aws_service_discovery_service" {
  defaults = {
    arn = "arn:aws:servicediscovery:us-east-1:123456789012:service/srv-mock"
  }
}

mock_resource "aws_kms_key" {
  defaults = {
    arn    = "arn:aws:kms:us-east-1:123456789012:key/0e1d2c3b-4a59-6877-8695-a4b3c2d1e0f9"
    key_id = "0e1d2c3b-4a59-6877-8695-a4b3c2d1e0f9"
  }
}
