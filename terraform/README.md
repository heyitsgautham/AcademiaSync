# AcademiaSync on AWS

This folder deploys the three AcademiaSync containers to ECS Fargate behind an Application Load Balancer.
The database is hosted outside AWS (Supabase or another managed Postgres) and reached through `database_url`.

## What it creates

| Module | Resources |
|---|---|
| `modules/vpc` | Two security groups in the account's default VPC, with every rule as its own resource |
| `modules/ecr` | One image repository per container, scanned on push, keeping the last five images |
| `modules/ecs` | The cluster with Container Insights, three task definitions and services, Cloud Map names for the two APIs, the load balancer and target groups, a KMS key, the SSM secrets and the IAM roles |
| `modules/cloudwatch` | CPU and memory alarms per service, load balancer and frontend 5xx alarms, and an unhealthy-target alarm per target group |
| `modules/sns` | The topic the alarms notify, with an email subscription |
| `bootstrap/` | A separate root module for the remote state bucket, lock table and key |

Traffic flows like this.

```
internet --80--> ALB --3000--> frontend task --5000/5001 over Cloud Map--> user-service, course-service
                  \--health checks on 3000, 5000, 5001
tasks --443--> ECR, CloudWatch Logs, SSM, Google
tasks --database_port--> hosted Postgres
```

The tasks run in the default VPC's public subnets with public IPs, because the stack has no NAT gateway.
The load balancer serves plain HTTP because there is no domain or certificate yet.
Add an HTTPS listener with an ACM certificate before real users sign in.

## Secrets

Terraform writes the six secrets (`nextauth_secret`, `google_client_secret`, `jwt_secret`, `jwt_refresh_secret`, `database_url`, `analytics_api_key`) to SSM Parameter Store as SecureString parameters under `/<project>/<environment>/`.
A customer-managed KMS key with yearly rotation encrypts them and the container log groups.
Task definitions reference each parameter by ARN, so no secret value appears in a task definition.
The execution role may read those six parameters and decrypt with that key, nothing more.

Each container receives only what its code reads.

| Container | Secrets |
|---|---|
| frontend | `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, `ANALYTICS_API_KEY` |
| user-service | `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ANALYTICS_API_KEY` |
| course-service | `DATABASE_URL`, `JWT_SECRET` |

The values still pass through Terraform state, so keep state in the encrypted bucket described below and never commit `terraform.tfvars` or `*.tfstate`.

## Deploy

You need Terraform 1.5 or later (1.7 or later to run the tests), the AWS CLI with credentials, and images pushed to the ECR repositories.

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # fill in every REPLACE_WITH value
terraform init
terraform plan
terraform apply
```

`./deploy.sh` runs the same steps and asks before applying, and `./cleanup.sh` destroys the stack after you type `destroy`.

Variables are validated at plan time.
`environment` must be `dev`, `staging` or `prod`, task CPU must be a Fargate size, the three signing secrets must be at least 32 characters, `database_url` must be a Postgres URL, and `admin_emails` must be a list of addresses.

After the first apply, confirm the SNS subscription email so alarms reach you.
`terraform output frontend_url` prints the address of the app.

The `Terraform Infrastructure Deployment` workflow runs plan, apply or destroy when started by hand from the Actions tab.
It reads the secrets from repository secrets, including `ANALYTICS_API_KEY`, and `admin_emails` from the `ADMIN_EMAILS_JSON` repository variable, for example `["you@example.com"]`.

### Stacks created before the security group rules moved into code

Those groups still carry hand-made rules.
Delete them, or import each one, before the next apply, or AWS rejects the duplicates.

```bash
terraform import 'module.vpc.aws_vpc_security_group_ingress_rule.alb_http' sgr-0123456789abcdef0
```

`./import-existing-resources.sh` imports the repositories, log groups, roles, target groups and load balancer of a stack whose state was lost.

## Remote state

State is local until you set up a backend.

```bash
cd terraform/bootstrap
terraform init
terraform apply -var state_bucket_name=<globally unique name>
```

The bootstrap creates a versioned S3 bucket encrypted with its own rotating KMS key, with public access blocked, a policy that denies requests without TLS, and old versions expiring after 90 days.
The DynamoDB lock table uses the same key and point-in-time recovery.
Copy `backend.tf.example` to `backend.tf`, fill in the three outputs, then run `terraform init -migrate-state` in `terraform/`.

## Monitoring

| Alarm | Fires when |
|---|---|
| `<service>-cpu-high`, `<service>-memory-high` | Average CPU or memory stays above `cpu_alarm_threshold` or `memory_alarm_threshold` (80%) for ten minutes |
| `alb-5xx` | The load balancer returns more than `http_5xx_threshold` (10) 5xx responses in five minutes |
| `frontend-5xx` | The frontend returns more than `http_5xx_threshold` 5xx responses in five minutes |
| `<service>-unhealthy-targets` | A target fails its health check for two minutes; the APIs fail `/health` when they lose the database |

Every alarm emails the SNS subscriber when it fires and when it clears.
Container Insights adds per-task CPU, memory, network and restart metrics, and `container_insights = false` turns it off.

```bash
aws logs tail /ecs/academiasync-prod/user-service --follow
aws cloudwatch describe-alarms --alarm-name-prefix academiasync-prod
```

## Checks

Run these from `terraform/`.
`terraform-ci.yml` runs all of them on every change under `terraform/`.

```bash
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
terraform test                 # 26 runs against a mocked AWS provider, no credentials needed
(cd bootstrap && terraform init -backend=false && terraform test)
tflint --init && tflint --recursive
checkov --config-file .checkov.yaml
trivy config --severity HIGH,CRITICAL modules
```

`terraform test` applies each module with the mocked provider in `tests/mocks/` and checks which secrets each container gets, the security group ports, the alarm names and dimensions, the load balancer name lengths and every variable validation.

Checkov and Trivy fail on any finding that is not accepted on its resource.
Each accepted finding has a `#checkov:skip` or `#trivy:ignore` comment that gives the reason, such as plain HTTP until a certificate exists or public IPs because there is no NAT gateway.
