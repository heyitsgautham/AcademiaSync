#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Config
GCP_PROJECT_ID=smart-learning-application
GCP_REGION=asia-south1
ARTIFACT_REGISTRY_REPO=academiasync-repo
REGISTRY_URL="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${ARTIFACT_REGISTRY_REPO}"

FRONTEND_SERVICE_NAME=academiasync-frontend

print_step() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

echo "🔄 Rebuilding Frontend with Production URLs"

# Get current service URLs
print_step "Fetching service URLs from Cloud Run"
USER_SERVICE_URL=$(gcloud run services describe academiasync-user-service --region=$GCP_REGION --format='value(status.url)')
COURSE_SERVICE_URL=$(gcloud run services describe academiasync-course-service --region=$GCP_REGION --format='value(status.url)')

print_success "User service: $USER_SERVICE_URL"
print_success "Course service: $COURSE_SERVICE_URL"

# Rebuild frontend with production URLs
print_step "Building frontend with production URLs (no cache)"
docker build --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_BACKEND_URL=${USER_SERVICE_URL} \
  --build-arg NEXT_PUBLIC_COURSE_SERVICE_URL=${COURSE_SERVICE_URL} \
  --no-cache \
  -t ${REGISTRY_URL}/frontend:latest \
  -f frontend/Dockerfile.cloudrun frontend

print_step "Pushing frontend image"
docker push ${REGISTRY_URL}/frontend:latest

print_step "Deploying updated frontend"
gcloud run deploy $FRONTEND_SERVICE_NAME \
    --image=${REGISTRY_URL}/frontend:latest \
    --region=$GCP_REGION \
    --quiet

FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE_NAME --region=$GCP_REGION --format='value(status.url)')

echo ""
echo -e "${GREEN}✅ DONE!${NC}"
echo ""
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo "The frontend has been rebuilt with:"
echo "  NEXT_PUBLIC_BACKEND_URL=$USER_SERVICE_URL"
echo "  NEXT_PUBLIC_COURSE_SERVICE_URL=$COURSE_SERVICE_URL"
