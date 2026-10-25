# AcademiaSync Terraform Infrastructure

This directory contains Terraform configuration for deploying AcademiaSync to AWS using ECS Fargate.

## 🏗️ Architecture

The infrastructure includes:
- **VPC**: Virtual Private Cloud with public subnets across 2 availability zones
- **ECR**: Elastic Container Registry for storing Docker images
- **ECS**: Elastic Container Service with Fargate for running containers
- **ALB**: Application Load Balancer for routing traffic
- **CloudWatch**: Monitoring and logging for all services
- **SNS**: Simple Notification Service for alarm notifications

## 📁 Structure

```
terraform/
├── main.tf                    # Root module - orchestrates all modules
├── variables.tf               # Variable definitions
├── outputs.tf                 # Output values
├── terraform.tfvars.example   # Example configuration (copy to terraform.tfvars)
├── .gitignore                 # Ignore sensitive files
├── deploy.sh                  # Deployment automation script
├── cleanup.sh                 # Resource cleanup script
└── modules/
    ├── vpc/                   # VPC, subnets, security groups
    ├── ecr/                   # Container image repositories
    ├── ecs/                   # ECS cluster, services, tasks
    ├── cloudwatch/            # Monitoring and alarms
    └── sns/                   # Notification topic
```

## 🚀 Prerequisites

1. **AWS Account**: Free tier eligible account
2. **AWS CLI**: Installed and configured
   ```bash
   aws configure
   ```
3. **Terraform**: Version >= 1.0
   ```bash
   brew install terraform  # macOS
   ```
4. **IAM Permissions**: User with AdministratorAccess or equivalent

## ⚙️ Configuration

1. **Copy example configuration**:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Edit `terraform.tfvars`** with your values:
   ```hcl
   alert_email = "your-email@example.com"
   
   # After creating ECR repos, update these:
   frontend_image       = "<account-id>.dkr.ecr.us-east-1.amazonaws.com/academiasync-prod-frontend:latest"
   user_service_image   = "<account-id>.dkr.ecr.us-east-1.amazonaws.com/academiasync-prod-user-service:latest"
   course_service_image = "<account-id>.dkr.ecr.us-east-1.amazonaws.com/academiasync-prod-course-service:latest"
   
   # Application secrets (use AWS Secrets Manager ARNs in production)
   nextauth_secret      = "your-nextauth-secret"
   nextauth_url         = "http://your-alb-url.amazonaws.com"
   google_client_id     = "your-google-client-id"
   google_client_secret = "your-google-client-secret"
   jwt_secret           = "your-jwt-secret"
   jwt_refresh_secret   = "your-jwt-refresh-secret"
   database_url         = "postgresql://user:pass@host:5432/db"
   ```

3. **⚠️ IMPORTANT**: Never commit `terraform.tfvars` - it's in `.gitignore`

## 📦 Deployment Steps

### Step 1: Initialize Terraform
```bash
cd terraform
terraform init
```

### Step 2: Validate Configuration
```bash
terraform validate
terraform fmt -recursive
```

### Step 3: Plan Deployment
```bash
terraform plan
```

### Step 4: Apply Configuration
```bash
# Option 1: Use automated script
chmod +x deploy.sh
./deploy.sh

# Option 2: Manual deployment
terraform apply
```

### Step 5: Get Outputs
```bash
terraform output
```

### Step 6: Confirm SNS Subscription
- Check your email for SNS subscription confirmation
- Click the confirmation link

### Step 7: Push Docker Images to ECR
```bash
# Get ECR login credentials
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag images
docker build -t academiasync-prod-frontend:latest ./frontend
docker tag academiasync-prod-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/academiasync-prod-frontend:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/academiasync-prod-frontend:latest

# Repeat for user-service and course-service
```

### Step 8: Update Task Definitions
After pushing images, update `terraform.tfvars` with actual ECR image URLs and run:
```bash
terraform apply
```

## 🔍 Monitoring

### CloudWatch Logs
```bash
# View logs
aws logs tail /ecs/academiasync-prod/frontend --follow
aws logs tail /ecs/academiasync-prod/user-service --follow
aws logs tail /ecs/academiasync-prod/course-service --follow
```

### CloudWatch Alarms
- CPU or memory above `cpu_alarm_threshold` or `memory_alarm_threshold` (80% by default) on any service
- More than 10 load balancer 5xx responses, or 10 frontend 5xx responses, in five minutes
- Any target failing its health check for two minutes, per service
- Every alarm emails the SNS topic subscriber when it fires and when it clears
- Container Insights is on by default (`container_insights = false` turns it off) and adds per-task CPU, memory, network and restart metrics

### ECS Service Status
```bash
aws ecs describe-services --cluster academiasync-prod-cluster --services academiasync-prod-frontend
```

## 💰 Cost Management

### Free Tier Limits
- **ECS Fargate**: 100 GB-hours per month (first 6 months)
- **Application Load Balancer**: 750 hours per month (first 12 months)
- **CloudWatch Logs**: 5 GB ingestion, 5 GB archive
- **CloudWatch Alarms**: 10 alarms
- **ECR**: 500 MB storage per month

### Current Configuration
- 3 services × 256 CPU (0.25 vCPU) × 512 MB RAM
- Running 24/7 ≈ 180 GB-hours per month (within free tier first 6 months)

### Monitor Costs
```bash
aws ce get-cost-and-usage --time-period Start=2025-01-01,End=2025-01-31 --granularity MONTHLY --metrics BlendedCost
```

## 🧹 Cleanup

To destroy all resources and avoid charges:

```bash
# Option 1: Use automated script
chmod +x cleanup.sh
./cleanup.sh

# Option 2: Manual cleanup
terraform destroy
```

**⚠️ Important**: Always verify in AWS Console that all resources are deleted!

## 🔐 Security Best Practices

1. **Secrets Management**:
   - Use AWS Secrets Manager for production secrets
   - Never commit `terraform.tfvars` or `.tfstate` files
   - Use IAM roles with least privilege

2. **Network Security**:
   - Every security group rule is a resource in `modules/vpc/main.tf`
   - The ALB accepts HTTP on port 80 from anywhere and only talks to the tasks on 3000, 5000 and 5001
   - ECS tasks accept those ports from the ALB, and 5000 and 5001 from each other for the frontend's server-side calls
   - Tasks reach out only on 443 (ECR, CloudWatch Logs, SSM, Google) and on `database_port` (default 5432)
   - Groups created before the rules moved into code still carry their hand-made rules.
     Delete those rules, or import each one with `terraform import 'module.vpc.aws_vpc_security_group_ingress_rule.alb_http' sgr-...`, before the next apply, or AWS rejects the duplicates.

3. **Container Security**:
   - ECR image scanning enabled on push
   - Use minimal base images (Alpine when possible)
   - Regularly update dependencies

## 🐛 Troubleshooting

### Issue: Terraform init fails
```bash
# Solution: Check AWS credentials
aws sts get-caller-identity
```

### Issue: ECS tasks not starting
```bash
# Check task logs
aws logs tail /ecs/academiasync-prod/frontend --follow

# Check service events
aws ecs describe-services --cluster academiasync-prod-cluster --services academiasync-prod-frontend
```

### Issue: Health checks failing
- Check security groups allow ALB → ECS communication
- Verify container exposes correct ports (3000, 5000, 5001)
- Check health check paths in target groups

### Issue: Can't access application
- Verify ALB DNS name from `terraform output frontend_url`
- Check ECS service has at least 1 running task
- Verify target group health checks are passing

## 📚 Resources

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS ECS Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

## 📝 Notes

- This configuration is optimized for AWS Free Tier
- Use in production requires additional security hardening
- Consider using Terraform Cloud for state management in team environments
- Always run `terraform plan` before `terraform apply`
