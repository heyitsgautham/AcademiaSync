#!/bin/bash

# Terraform Deployment Script for AcademiaSync
# This script automates the deployment process

set -e

echo "🚀 AcademiaSync Terraform Deployment"
echo "===================================="

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed. Please install Terraform first."
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo "❌ terraform.tfvars not found!"
    echo "📝 Please create terraform.tfvars from terraform.tfvars.example"
    echo "   cp terraform.tfvars.example terraform.tfvars"
    echo "   Then edit terraform.tfvars with your actual values"
    exit 1
fi

echo ""
echo "✅ Prerequisites check passed"
echo ""

# Initialize Terraform
echo "📦 Initializing Terraform..."
terraform init

echo ""
echo "🔍 Validating Terraform configuration..."
terraform validate

echo ""
echo "📋 Formatting Terraform files..."
terraform fmt -recursive

echo ""
echo "🗺️  Creating Terraform plan..."
terraform plan -out=tfplan

echo ""
echo "⚠️  WARNING: This will create AWS resources that may incur costs!"
echo "   Make sure you're using Free Tier eligible resources only."
echo ""
read -p "Do you want to apply this plan? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    rm -f tfplan
    exit 0
fi

echo ""
echo "🏗️  Applying Terraform configuration..."
terraform apply tfplan

rm -f tfplan

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Important Outputs:"
terraform output

echo ""
echo "⚠️  Next Steps:"
echo "1. Check your email and confirm the SNS subscription for CloudWatch alarms"
echo "2. Push Docker images to ECR repositories"
echo "3. Update ECS task definitions with new image URLs"
echo "4. Monitor CloudWatch logs and metrics"
echo ""
echo "📌 To destroy resources later, run: ./cleanup.sh"
