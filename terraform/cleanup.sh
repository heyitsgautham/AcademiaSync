#!/bin/bash

# Terraform Cleanup Script for AcademiaSync
# This script destroys all AWS resources created by Terraform

set -e

echo "🗑️  AcademiaSync Terraform Cleanup"
echo "=================================="
echo ""
echo "⚠️  WARNING: This will destroy ALL AWS resources created by Terraform!"
echo "   - VPC and networking components"
echo "   - ECR repositories and Docker images"
echo "   - ECS cluster and running tasks"
echo "   - CloudWatch alarms and log groups"
echo "   - SNS topic and subscriptions"
echo "   - Application Load Balancer"
echo ""
read -p "Are you ABSOLUTELY sure you want to continue? Type 'destroy' to confirm: " confirm

if [ "$confirm" != "destroy" ]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo ""
echo "🔍 Showing resources that will be destroyed..."
terraform plan -destroy

echo ""
read -p "Proceed with destruction? (yes/no): " final_confirm

if [ "$final_confirm" != "yes" ]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo ""
echo "🗑️  Destroying resources..."
terraform destroy -auto-approve

echo ""
echo "✅ All resources have been destroyed!"
echo ""
echo "💡 Tips:"
echo "   - Verify in AWS Console that all resources are deleted"
echo "   - Check for any remaining resources that might incur costs"
echo "   - ECR images are deleted, but check S3 buckets if any were created"
