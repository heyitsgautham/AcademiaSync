# Checks that bad input stops at plan time with a clear message instead of failing halfway through an apply.

mock_provider "aws" {
  source = "./tests/mocks"
}

variables {
  alert_email          = "ops@example.com"
  nextauth_secret      = "test-nextauth-secret-0123456789abcdef"
  google_client_id     = "test-client.apps.googleusercontent.com"
  google_client_secret = "test-google-secret"
  jwt_secret           = "test-jwt-secret-0123456789abcdef0123"
  jwt_refresh_secret   = "test-jwt-refresh-secret-0123456789abc"
  database_url         = "postgresql://app:pw@db.example.com:5432/academiasync"
  analytics_api_key    = "test-analytics-key"
}

run "accepts_valid_input" {
  command = plan

  variables {
    environment    = "staging"
    frontend_cpu   = 512
    admin_emails   = ["owner@example.com"]
    user_service_memory = 1024
  }
}

run "rejects_an_unknown_environment" {
  command = plan

  variables {
    environment = "production"
  }

  expect_failures = [var.environment]
}

run "rejects_a_project_name_with_capitals" {
  command = plan

  variables {
    project_name = "AcademiaSync"
  }

  expect_failures = [var.project_name]
}

run "rejects_a_malformed_alert_email" {
  command = plan

  variables {
    alert_email = "ops.example.com"
  }

  expect_failures = [var.alert_email]
}

run "rejects_a_cpu_size_fargate_does_not_offer" {
  command = plan

  variables {
    course_service_cpu = 300
  }

  expect_failures = [var.course_service_cpu]
}

run "rejects_memory_below_the_fargate_minimum" {
  command = plan

  variables {
    frontend_memory = 256
  }

  expect_failures = [var.frontend_memory]
}

run "rejects_a_short_jwt_secret" {
  command = plan

  variables {
    jwt_secret = "change-me"
  }

  expect_failures = [var.jwt_secret]
}

run "rejects_a_database_url_that_is_not_postgres" {
  command = plan

  variables {
    database_url = "mysql://app:pw@db.example.com/academiasync"
  }

  expect_failures = [var.database_url]
}

run "rejects_a_comma_separated_admin_string" {
  command = plan

  variables {
    admin_emails = ["a@example.com,b@example.com"]
  }

  expect_failures = [var.admin_emails]
}

run "rejects_an_alarm_threshold_above_100" {
  command = plan

  variables {
    cpu_alarm_threshold = 150
  }

  expect_failures = [var.cpu_alarm_threshold]
}
