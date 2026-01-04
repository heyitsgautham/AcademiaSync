#!/bin/bash

# Force cleanup script for stuck AcademiaSync resources in us-east-1
# This script tries multiple approaches to clean up remaining resources

set -e

echo "🔧 Force Cleanup of AcademiaSync Resources"
echo "=========================================="
echo ""
echo "Region: us-east-1"
echo "This script will try multiple cleanup approaches"
echo ""

read -p "Continue with force cleanup? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo ""
echo "🧹 Attempt 1: Try VPC deletion directly..."

# Try to delete VPCs
for vpc_id in vpc-0d32062cfe80fd256 vpc-0d731a002bf1fe0ce vpc-0be84df0ce04c4bc5; do
    echo "Trying to delete $vpc_id..."
    if aws ec2 delete-vpc --region us-east-1 --vpc-id $vpc_id 2>/dev/null; then
        echo "✅ Successfully deleted $vpc_id"
    else
        echo "❌ Failed to delete $vpc_id"
    fi
done

echo ""
echo "🔍 Checking remaining resources..."

# Check what's left
remaining_vpcs=$(aws ec2 describe-vpcs --region us-east-1 --filters "Name=tag:Name,Values=*academia*" --query 'Vpcs[*].VpcId' --output text 2>/dev/null || echo "")

if [ -z "$remaining_vpcs" ]; then
    echo "✅ All VPCs successfully deleted!"
    exit 0
fi

echo "❌ Still have remaining VPCs: $remaining_vpcs"
echo ""
echo "📋 Manual Cleanup Instructions:"
echo "================================"
echo ""
echo "Since automated cleanup failed, please clean up manually in AWS Console:"
echo ""
echo "1. Go to AWS Console: https://us-east-1.console.aws.amazon.com/vpc/home?region=us-east-1"
echo ""
echo "2. For each remaining VPC, check these dependencies:"
echo "   - Subnets (should be none)"
echo "   - Internet Gateways (detach if attached)"
echo "   - NAT Gateways (delete if present)"
echo "   - Network Interfaces (should be none)"
echo "   - Security Groups (only default should remain)"
echo "   - Route Tables (main route table should remain)"
echo "   - Network ACLs (only default should remain)"
echo ""
echo "3. If VPC deletion still fails:"
echo "   - Check CloudTrail for recent activity"
echo "   - Contact AWS Support if VPC appears empty but won't delete"
echo "   - VPCs may take time to fully clean up"
echo ""
echo "4. Monitor billing to ensure no charges accrue"
echo ""
echo "Remaining VPCs to clean up: $remaining_vpcs"
