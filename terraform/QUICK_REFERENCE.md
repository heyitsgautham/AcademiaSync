# 🚀 Terraform Quick Reference

## Common Commands

### Initialization & Validation
```bash
terraform init              # Initialize Terraform and download providers
terraform validate          # Check configuration syntax
terraform fmt -recursive    # Format all .tf files
```

### Planning & Deployment
```bash
terraform plan              # Preview changes (dry run)
terraform plan -out=tfplan  # Save plan to file
terraform apply             # Apply changes (prompts for confirmation)
terraform apply -auto-approve  # Apply without confirmation (use carefully!)
terraform apply tfplan      # Apply saved plan
```

### Inspection & Output
```bash
terraform show              # Show current state
terraform output            # Show all outputs
terraform output vpc_id     # Show specific output
terraform state list        # List all resources in state
terraform state show <resource>  # Show specific resource details
```

### Cleanup
```bash
terraform destroy           # Destroy all resources (prompts for confirmation)
terraform destroy -auto-approve  # Destroy without confirmation
```

### Troubleshooting
```bash
terraform refresh           # Update state from real infrastructure
terraform taint <resource>  # Mark resource for recreation
terraform untaint <resource>  # Unmark resource
terraform console           # Interactive console for testing expressions
```

---

## Project-Specific Commands

### Initial Setup
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform init
terraform validate
terraform plan
```

### Deploy Infrastructure
```bash
./deploy.sh                 # Automated deployment script
# OR
terraform apply
```

### Get ECR URLs (after first apply)
```bash
terraform output ecr_repository_urls
```

### Get Frontend URL
```bash
terraform output frontend_url
# OR
echo "http://$(terraform output -raw frontend_url)"
```

### View Logs (requires AWS CLI)
```bash
# Get log group names
terraform output cloudwatch_log_groups

# Tail logs
aws logs tail /ecs/academiasync-prod/frontend --follow
aws logs tail /ecs/academiasync-prod/user-service --follow
aws logs tail /ecs/academiasync-prod/course-service --follow
```

### Update Container Images
```bash
# 1. Update terraform.tfvars with new ECR image URLs
# 2. Apply changes
terraform apply
```

### Complete Cleanup
```bash
./cleanup.sh                # Automated cleanup script
# OR
terraform destroy
```

---

## AWS-Specific Commands

### ECR Login
```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $(terraform output -raw ecr_repository_urls | jq -r '.[0]' | cut -d'/' -f1)
```

### List ECS Services
```bash
aws ecs list-services --cluster $(terraform output -raw ecs_cluster_name)
```

### Check ECS Service Health
```bash
aws ecs describe-services \
  --cluster $(terraform output -raw ecs_cluster_name) \
  --services $(terraform output -raw frontend_service_name)
```

### List CloudWatch Alarms
```bash
aws cloudwatch describe-alarms --alarm-name-prefix academiasync-prod
```

---

## File Structure

```
terraform/
├── main.tf                 # Root module - orchestrates everything
├── variables.tf            # Variable definitions
├── outputs.tf              # Output definitions
├── terraform.tfvars        # Your configuration (gitignored)
├── terraform.tfvars.example # Example configuration
├── .gitignore              # Ignore sensitive files
├── deploy.sh               # Deployment automation
├── cleanup.sh              # Cleanup automation
├── README.md               # Full documentation
├── TEST_RESULTS.md         # Test validation results
└── modules/
    ├── vpc/                # Networking
    ├── ecr/                # Container registry
    ├── ecs/                # Container orchestration
    ├── cloudwatch/         # Monitoring
    └── sns/                # Notifications
```

---

## Important Variables

### Required (must set in terraform.tfvars)
- `alert_email` - Your email for CloudWatch alarms
- `nextauth_secret` - NextAuth secret key
- `google_client_id` - Google OAuth client ID
- `google_client_secret` - Google OAuth client secret
- `jwt_secret` - JWT secret key
- `jwt_refresh_secret` - JWT refresh secret
- `database_url` - Database connection string

### Optional (have defaults)
- `aws_region` - Default: us-east-1
- `project_name` - Default: academiasync
- `environment` - Default: prod
- `cpu_alarm_threshold` - Default: 80
- `memory_alarm_threshold` - Default: 80

---

## Outputs Available

```bash
terraform output           # Shows all outputs

# Individual outputs:
terraform output vpc_id
terraform output public_subnet_ids
terraform output ecr_repository_urls
terraform output ecs_cluster_name
terraform output frontend_url
terraform output user_service_url
terraform output course_service_url
terraform output sns_topic_arn
terraform output cloudwatch_log_groups
```

---

## Cost Management

### Check Current Costs
```bash
aws ce get-cost-and-usage \
  --time-period Start=$(date -u +%Y-%m-01),End=$(date -u +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost
```

### List All Resources (for verification)
```bash
terraform state list
```

### Estimate Costs Before Deployment
- Use AWS Pricing Calculator: https://calculator.aws/
- Free Tier limits:
  - ECS Fargate: 100 GB-hours/month (6 months)
  - ALB: 750 hours/month (12 months)
  - CloudWatch: 10 alarms, 5 GB logs

---

## Troubleshooting

### Error: terraform.tfvars not found
```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### Error: No credentials
```bash
aws configure
# Enter your Access Key ID and Secret Access Key
```

### Error: Insufficient capacity
```bash
# Try different availability zones
# Edit terraform.tfvars:
availability_zones = ["us-east-1c", "us-east-1d"]
terraform apply
```

### Error: Health check failing
```bash
# Check ECS service logs
aws logs tail /ecs/academiasync-prod/frontend --follow

# Check service events
aws ecs describe-services \
  --cluster academiasync-prod-cluster \
  --services academiasync-prod-frontend
```

### State is out of sync
```bash
terraform refresh
terraform plan  # Verify changes
```

---

## Best Practices

1. **Always run `terraform plan` before `apply`**
2. **Never commit terraform.tfvars** (contains secrets)
3. **Use `-out` flag for production deployments**
4. **Run `terraform destroy` after demos** (avoid costs)
5. **Keep state file secure** (contains sensitive data)
6. **Review changes carefully** before confirming
7. **Use version control** for .tf files
8. **Document changes** in commit messages

---

## Emergency Commands

### Force unlock (if state is locked)
```bash
terraform force-unlock <lock-id>
```

### Remove resource from state (without destroying)
```bash
terraform state rm <resource>
```

### Import existing resource
```bash
terraform import <resource> <id>
```

### Recreate specific resource
```bash
terraform taint <resource>
terraform apply
```

---

## Useful Aliases (add to ~/.zshrc)

```bash
alias tf='terraform'
alias tfi='terraform init'
alias tfv='terraform validate'
alias tff='terraform fmt -recursive'
alias tfp='terraform plan'
alias tfa='terraform apply'
alias tfd='terraform destroy'
alias tfo='terraform output'
alias tfs='terraform state list'
```

---

**Quick Start:**
```bash
cd terraform
terraform init
terraform plan
./deploy.sh
```

**Quick Cleanup:**
```bash
cd terraform
./cleanup.sh
```
