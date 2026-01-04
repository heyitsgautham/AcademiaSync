#!/bin/bash

# Manual cleanup script for remaining AcademiaSync VPCs in us-east-1
# Run this after terraform destroy to clean up any remaining resources

set -e

echo "🧹 Manual Cleanup of Remaining AcademiaSync Resources"
echo "=================================================="
echo ""
echo "Region: us-east-1"
echo "Resources to clean up:"
echo "  - 3 VPCs: vpc-0d32062cfe80fd256, vpc-0d731a002bf1fe0ce, vpc-0be84df0ce04c4bc5"
echo "  - Associated route tables and network ACLs will be auto-deleted"
echo ""

read -p "Continue with manual cleanup? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo ""
echo "🗑️  Deleting VPCs..."

# Delete VPCs (this will automatically delete associated route tables and network ACLs)
echo "Deleting vpc-0d32062cfe80fd256..."
aws ec2 delete-vpc --region us-east-1 --vpc-id vpc-0d32062cfe80fd256

echo "Deleting vpc-0d731a002bf1fe0ce..."
aws ec2 delete-vpc --region us-east-1 --vpc-id vpc-0d731a002bf1fe0ce

echo "Deleting vpc-0be84df0ce04c4bc5..."
aws ec2 delete-vpc --region us-east-1 --vpc-id vpc-0be84df0ce04c4bc5

echo ""
echo "✅ All remaining VPCs deleted!"
echo ""
echo "🔍 Verifying cleanup..."
echo ""

# Verify cleanup
echo "Checking for remaining VPCs..."
aws ec2 describe-vpcs --region us-east-1 --filters "Name=tag:Name,Values=*academia*" --query 'Vpcs[*].VpcId' --output text || echo "No AcademiaSync VPCs found"

echo ""
echo "🎉 Manual cleanup complete!"
echo ""
echo "💡 Next steps:"
echo "   - Check AWS Billing dashboard"
echo "   - Verify no charges in Cost Explorer"
echo "   - Set up billing alerts if needed"
