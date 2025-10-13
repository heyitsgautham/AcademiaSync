#!/bin/bash

# AcademiaSync Deployment Helper Script
# For: heyitsgautham@gmail.com
# AWS Account: 122931671956

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║         🚀 AcademiaSync Deployment Helper                     ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Menu
echo -e "\n${GREEN}What would you like to do?${NC}\n"
echo "1) View deployment guide"
echo "2) Check deployment status"
echo "3) Verify AWS credentials"
echo "4) Initialize Terraform"
echo "5) Deploy infrastructure (terraform apply)"
echo "6) View ALB URL"
echo "7) Check ECS services"
echo "8) View logs (frontend)"
echo "9) View logs (user-service)"
echo "10) View logs (course-service)"
echo "11) Build and push Docker images"
echo "12) Destroy infrastructure (cleanup)"
echo "13) Show all secrets"
echo "0) Exit"

echo -e "\n${YELLOW}Enter your choice:${NC} "
read -r choice

case $choice in
  1)
    echo -e "\n${GREEN}Opening deployment guide...${NC}\n"
    cat PERSONAL_DEPLOYMENT_GUIDE.md | less
    ;;
  
  2)
    echo -e "\n${GREEN}Checking deployment status...${NC}\n"
    cat START_HERE.md
    ;;
  
  3)
    echo -e "\n${GREEN}Verifying AWS credentials...${NC}\n"
    aws sts get-caller-identity
    echo -e "\n${GREEN}✓ AWS credentials are valid!${NC}"
    ;;
  
  4)
    echo -e "\n${GREEN}Initializing Terraform...${NC}\n"
    cd terraform
    terraform init
    terraform validate
    terraform fmt -recursive
    echo -e "\n${GREEN}✓ Terraform initialized and validated!${NC}"
    cd ..
    ;;
  
  5)
    echo -e "\n${YELLOW}⚠️  This will create 44 AWS resources!${NC}"
    echo -e "${YELLOW}⚠️  Make sure you've completed Steps 1-4 in PERSONAL_DEPLOYMENT_GUIDE.md${NC}"
    echo -e "\n${YELLOW}Continue? (yes/no):${NC} "
    read -r confirm
    if [ "$confirm" = "yes" ]; then
      cd terraform
      terraform plan
      echo -e "\n${YELLOW}Apply this plan? (yes/no):${NC} "
      read -r apply_confirm
      if [ "$apply_confirm" = "yes" ]; then
        terraform apply
        echo -e "\n${GREEN}✓ Infrastructure deployed!${NC}"
        echo -e "\n${GREEN}ALB URL:${NC}"
        terraform output alb_dns_name
      fi
      cd ..
    fi
    ;;
  
  6)
    echo -e "\n${GREEN}Getting ALB URL...${NC}\n"
    cd terraform
    terraform output alb_dns_name
    cd ..
    ;;
  
  7)
    echo -e "\n${GREEN}Checking ECS services...${NC}\n"
    aws ecs describe-services \
      --cluster academiasync-cluster \
      --services frontend user-service course-service \
      --region us-east-1 \
      --query 'services[*].[serviceName,status,runningCount,desiredCount]' \
      --output table
    ;;
  
  8)
    echo -e "\n${GREEN}Viewing frontend logs (Ctrl+C to exit)...${NC}\n"
    aws logs tail /ecs/academiasync-frontend --follow --region us-east-1
    ;;
  
  9)
    echo -e "\n${GREEN}Viewing user-service logs (Ctrl+C to exit)...${NC}\n"
    aws logs tail /ecs/academiasync-user-service --follow --region us-east-1
    ;;
  
  10)
    echo -e "\n${GREEN}Viewing course-service logs (Ctrl+C to exit)...${NC}\n"
    aws logs tail /ecs/academiasync-course-service --follow --region us-east-1
    ;;
  
  11)
    echo -e "\n${GREEN}Building and pushing Docker images...${NC}\n"
    
    # Login to ECR
    echo -e "${BLUE}→ Logging in to ECR...${NC}"
    aws ecr get-login-password --region us-east-1 | \
      docker login --username AWS --password-stdin \
      122931671956.dkr.ecr.us-east-1.amazonaws.com
    
    # Build frontend
    echo -e "\n${BLUE}→ Building frontend...${NC}"
    docker build -t 122931671956.dkr.ecr.us-east-1.amazonaws.com/academiasync-frontend:latest \
      -f frontend/Dockerfile frontend/
    
    echo -e "${BLUE}→ Pushing frontend...${NC}"
    docker push 122931671956.dkr.ecr.us-east-1.amazonaws.com/academiasync-frontend:latest
    
    # Build user-service
    echo -e "\n${BLUE}→ Building user-service...${NC}"
    docker build -t 122931671956.dkr.ecr.us-east-1.amazonaws.com/academiasync-user-service:latest \
      -f backend/user-service/Dockerfile backend/user-service/
    
    echo -e "${BLUE}→ Pushing user-service...${NC}"
    docker push 122931671956.dkr.ecr.us-east-1.amazonaws.com/academiasync-user-service:latest
    
    # Build course-service
    echo -e "\n${BLUE}→ Building course-service...${NC}"
    docker build -t 122931671956.dkr.ecr.us-east-1.amazonaws.com/academiasync-course-service:latest \
      -f backend/course-service/Dockerfile backend/course-service/
    
    echo -e "${BLUE}→ Pushing course-service...${NC}"
    docker push 122931671956.dkr.ecr.us-east-1.amazonaws.com/academiasync-course-service:latest
    
    echo -e "\n${GREEN}✓ All images built and pushed!${NC}"
    echo -e "\n${YELLOW}Next: Update terraform/terraform.tfvars with ECR image URLs${NC}"
    echo -e "${YELLOW}Then run: cd terraform && terraform apply${NC}"
    ;;
  
  12)
    echo -e "\n${RED}⚠️  WARNING: This will DELETE all AWS resources!${NC}"
    echo -e "${RED}⚠️  You will LOSE all data!${NC}"
    echo -e "\n${YELLOW}Are you ABSOLUTELY sure? (type 'destroy' to confirm):${NC} "
    read -r confirm
    if [ "$confirm" = "destroy" ]; then
      cd terraform
      terraform destroy
      echo -e "\n${GREEN}✓ Infrastructure destroyed!${NC}"
      cd ..
    else
      echo -e "\n${BLUE}Cancelled.${NC}"
    fi
    ;;
  
  13)
    echo -e "\n${GREEN}Showing all secrets from .env.deployment...${NC}\n"
    if [ -f .env.deployment ]; then
      cat .env.deployment
    else
      echo -e "${RED}Error: .env.deployment not found!${NC}"
    fi
    ;;
  
  0)
    echo -e "\n${BLUE}Goodbye!${NC}\n"
    exit 0
    ;;
  
  *)
    echo -e "\n${RED}Invalid choice!${NC}"
    exit 1
    ;;
esac

echo -e "\n${BLUE}Done!${NC}\n"
