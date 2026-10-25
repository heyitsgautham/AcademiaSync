# Checks the network rules in the vpc module.

mock_provider "aws" {
  source = "./tests/mocks"
}

variables {
  project_name = "academiasync"
  environment  = "prod"
}

run "only_the_load_balancer_faces_the_internet" {
  command = plan

  module {
    source = "./modules/vpc"
  }

  assert {
    condition     = aws_vpc_security_group_ingress_rule.alb_http.cidr_ipv4 == "0.0.0.0/0" && aws_vpc_security_group_ingress_rule.alb_http.from_port == 80
    error_message = "The load balancer should accept HTTP from anywhere."
  }

  assert {
    condition     = alltrue([for r in aws_vpc_security_group_ingress_rule.tasks_from_alb : r.cidr_ipv4 == null])
    error_message = "ECS tasks must not accept traffic from an IP range, only from the load balancer group."
  }

  assert {
    condition     = toset([for r in aws_vpc_security_group_ingress_rule.tasks_from_alb : r.from_port]) == toset([3000, 5000, 5001])
    error_message = "The load balancer reaches the three container ports and nothing else."
  }

  assert {
    condition     = toset([for r in aws_vpc_security_group_ingress_rule.tasks_from_tasks : r.from_port]) == toset([5000, 5001])
    error_message = "Tasks reach each other only on the two API ports."
  }
}

run "tasks_reach_out_only_on_https_and_postgres" {
  command = plan

  module {
    source = "./modules/vpc"
  }

  variables {
    database_port = 6543
  }

  assert {
    condition     = aws_vpc_security_group_egress_rule.tasks_https.from_port == 443 && aws_vpc_security_group_egress_rule.tasks_https.to_port == 443
    error_message = "Outbound internet traffic is limited to HTTPS."
  }

  assert {
    condition     = aws_vpc_security_group_egress_rule.tasks_database.from_port == 6543
    error_message = "The database rule should follow database_port."
  }
}

run "rejects_an_invalid_database_port" {
  command = plan

  module {
    source = "./modules/vpc"
  }

  variables {
    database_port = 70000
  }

  expect_failures = [var.database_port]
}
