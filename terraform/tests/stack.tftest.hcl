# Plans and applies the whole stack against a mocked AWS provider.
# Nothing reaches AWS: run with `terraform test` after `terraform init -backend=false`.

mock_provider "aws" {
  source = "./tests/mocks"
}

variables {
  alert_email          = "ops@example.com"
  nextauth_secret      = "test-nextauth-secret"
  google_client_id     = "test-client.apps.googleusercontent.com"
  google_client_secret = "test-google-secret"
  jwt_secret           = "test-jwt-secret"
  jwt_refresh_secret   = "test-jwt-refresh-secret"
  database_url         = "postgresql://app:pw@db.example.com:5432/academiasync"
}

run "creates_the_stack" {
  assert {
    condition     = output.ecs_cluster_name == "academiasync-prod-cluster"
    error_message = "The cluster name should follow <project>-<environment>-cluster."
  }

  assert {
    condition     = length(output.ecr_repository_urls) == 3
    error_message = "One ECR repository per container image is expected."
  }

  assert {
    condition     = startswith(output.frontend_url, "http://")
    error_message = "The frontend URL should come from the load balancer DNS name."
  }
}
