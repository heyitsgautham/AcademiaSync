#!/bin/bash

# AcademiaSync Terraform Import Script
# Run this script to import existing AWS resources into Terraform state
# This prevents "ResourceAlreadyExistsException" errors

set -e

echo "🚀 Starting AcademiaSync Terraform Import Process"
echo "=================================================="

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo "❌ Error: terraform.tfvars not found!"
    echo "Please copy terraform.tfvars.example to terraform.tfvars and configure your values"
    exit 1
fi

# Load variables from terraform.tfvars
PROJECT_NAME=$(grep 'project_name' terraform.tfvars | cut -d'=' -f2 | tr -d '"' | tr -d ' ')
ENVIRONMENT=$(grep 'environment' terraform.tfvars | cut -d'=' -f2 | tr -d '"' | tr -d ' ')

echo "📋 Configuration:"
echo "   Project: $PROJECT_NAME"
echo "   Environment: $ENVIRONMENT"
echo ""

# Initialize Terraform if not already done
if [ ! -d ".terraform" ]; then
    echo "🔧 Initializing Terraform..."
    terraform init
fi

echo "📥 Importing existing AWS resources..."
echo ""

# Import ECR Repositories
echo "🏗️  Importing ECR Repositories..."
terraform import "module.ecr.aws_ecr_repository.repos[\"frontend\"]" "${PROJECT_NAME}-${ENVIRONMENT}-frontend" 2>/dev/null && echo "✅ Imported ECR: frontend" || echo "ℹ️  ECR frontend already imported or doesn't exist"
terraform import "module.ecr.aws_ecr_repository.repos[\"user-service\"]" "${PROJECT_NAME}-${ENVIRONMENT}-user-service" 2>/dev/null && echo "✅ Imported ECR: user-service" || echo "ℹ️  ECR user-service already imported or doesn't exist"
terraform import "module.ecr.aws_ecr_repository.repos[\"course-service\"]" "${PROJECT_NAME}-${ENVIRONMENT}-course-service" 2>/dev/null && echo "✅ Imported ECR: course-service" || echo "ℹ️  ECR course-service already imported or doesn't exist"

echo ""

# Import CloudWatch Log Groups
echo "📊 Importing CloudWatch Log Groups..."
terraform import "module.ecs.aws_cloudwatch_log_group.frontend" "/ecs/${PROJECT_NAME}-${ENVIRONMENT}/frontend" 2>/dev/null && echo "✅ Imported Log Group: frontend" || echo "ℹ️  Log Group frontend already imported or doesn't exist"
terraform import "module.ecs.aws_cloudwatch_log_group.user_service" "/ecs/${PROJECT_NAME}-${ENVIRONMENT}/user-service" 2>/dev/null && echo "✅ Imported Log Group: user-service" || echo "ℹ️  Log Group user-service already imported or doesn't exist"
terraform import "module.ecs.aws_cloudwatch_log_group.course_service" "/ecs/${PROJECT_NAME}-${ENVIRONMENT}/course-service" 2>/dev/null && echo "✅ Imported Log Group: course-service" || echo "ℹ️  Log Group course-service already imported or doesn't exist"

echo ""

# Import IAM Roles
echo "🔐 Importing IAM Roles..."
terraform import "module.ecs.aws_iam_role.ecs_task_execution" "${PROJECT_NAME}-${ENVIRONMENT}-ecs-task-execution" 2>/dev/null && echo "✅ Imported IAM Role: ecs-task-execution" || echo "ℹ️  IAM Role ecs-task-execution already imported or doesn't exist"
terraform import "module.ecs.aws_iam_role.ecs_task" "${PROJECT_NAME}-${ENVIRONMENT}-ecs-task" 2>/dev/null && echo "✅ Imported IAM Role: ecs-task" || echo "ℹ️  IAM Role ecs-task already imported or doesn't exist"

echo ""

# Import IAM Policy Attachments (if roles exist)
echo "📎 Importing IAM Policy Attachments..."
terraform import "module.ecs.aws_iam_role_policy_attachment.ecs_task_execution" "${PROJECT_NAME}-${ENVIRONMENT}-ecs-task-execution/arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy" 2>/dev/null && echo "✅ Imported IAM Policy Attachment: ecs-task-execution" || echo "ℹ️  Policy attachment already imported or role doesn't exist"

echo ""
echo "🎯 Import process completed!"
echo ""
echo "📋 Next steps:"
echo "1. Run 'terraform plan' to see what will be created/modified"
echo "2. Review the plan carefully"
echo "3. Run 'terraform apply' to deploy (this will cost money!)"
echo ""
echo "⚠️  Remember to run 'terraform destroy' after your demo to avoid charges!"