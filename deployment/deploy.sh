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

USER_SERVICE_NAME=academiasync-user-service
COURSE_SERVICE_NAME=academiasync-course-service
FRONTEND_SERVICE_NAME=academiasync-frontend

# Database (Supabase)
DB_HOST=db.bdjvbfrrohqykxuushok.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres

# Load secrets from .env
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

source .env

# Get Supabase password
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-${DB_PASSWORD:-}}"

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ Set SUPABASE_DB_PASSWORD in .env file!${NC}"
    echo "Get it from: https://supabase.com/dashboard/project/bdjvbfrrohqykxuushok/settings/database"
    exit 1
fi

print_step() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

echo "🚀 AcademiaSync Deployment"

# Set GCP project
print_step "Setting GCP project"
gcloud config set project $GCP_PROJECT_ID --quiet

# Enable APIs
print_step "Enabling APIs"
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com --quiet 2>/dev/null || true

# Create Artifact Registry
print_step "Setting up Artifact Registry"
gcloud artifacts repositories create $ARTIFACT_REGISTRY_REPO \
    --repository-format=docker \
    --location=$GCP_REGION \
    --description="AcademiaSync" 2>/dev/null || true

gcloud auth configure-docker ${GCP_REGION}-docker.pkg.dev --quiet

REGISTRY_URL="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${ARTIFACT_REGISTRY_REPO}"

# Build & Push
print_step "Building user-service"
docker build -t ${REGISTRY_URL}/user-service:latest -f backend/user-service/Dockerfile.cloudrun backend/user-service
docker push ${REGISTRY_URL}/user-service:latest

print_step "Building course-service"
docker build -t ${REGISTRY_URL}/course-service:latest -f backend/course-service/Dockerfile.cloudrun backend/course-service
docker push ${REGISTRY_URL}/course-service:latest

print_step "Building frontend"
docker build -t ${REGISTRY_URL}/frontend:latest -f frontend/Dockerfile.cloudrun frontend
docker push ${REGISTRY_URL}/frontend:latest

# Deploy Services
print_step "Deploying user-service"
gcloud run deploy $USER_SERVICE_NAME \
    --image=${REGISTRY_URL}/user-service:latest \
    --region=$GCP_REGION \
    --allow-unauthenticated \
    --set-env-vars="DB_HOST=${DB_HOST},DB_PORT=${DB_PORT},DB_NAME=${DB_NAME},DB_USER=${DB_USER},DB_PASSWORD=${DB_PASSWORD},JWT_SECRET=${JWT_SECRET},JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET},JWT_ACCESS_EXPIRY=${JWT_ACCESS_EXPIRY},JWT_REFRESH_EXPIRY=${JWT_REFRESH_EXPIRY},GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID},NODE_ENV=production,ANALYTICS_API_KEY=${ANALYTICS_API_KEY}" \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --timeout=300 \
    --quiet

USER_SERVICE_URL=$(gcloud run services describe $USER_SERVICE_NAME --region=$GCP_REGION --format='value(status.url)')
print_success "User service: $USER_SERVICE_URL"

print_step "Deploying course-service"
gcloud run deploy $COURSE_SERVICE_NAME \
    --image=${REGISTRY_URL}/course-service:latest \
    --region=$GCP_REGION \
    --allow-unauthenticated \
    --set-env-vars="DB_HOST=${DB_HOST},DB_PORT=${DB_PORT},DB_NAME=${DB_NAME},DB_USER=${DB_USER},DB_PASSWORD=${DB_PASSWORD},JWT_SECRET=${JWT_SECRET},JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET},NODE_ENV=production" \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --timeout=300 \
    --quiet

COURSE_SERVICE_URL=$(gcloud run services describe $COURSE_SERVICE_NAME --region=$GCP_REGION --format='value(status.url)')
print_success "Course service: $COURSE_SERVICE_URL"

print_step "Deploying frontend"
gcloud run deploy $FRONTEND_SERVICE_NAME \
    --image=${REGISTRY_URL}/frontend:latest \
    --region=$GCP_REGION \
    --allow-unauthenticated \
    --set-env-vars="NEXT_PUBLIC_BACKEND_URL=${USER_SERVICE_URL},NEXT_PUBLIC_COURSE_SERVICE_URL=${COURSE_SERVICE_URL},INTERNAL_BACKEND_URL=${USER_SERVICE_URL},INTERNAL_COURSE_SERVICE_URL=${COURSE_SERVICE_URL},GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID},GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET},NEXTAUTH_SECRET=${NEXTAUTH_SECRET},ANALYTICS_API_KEY=${ANALYTICS_API_KEY}" \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --timeout=300 \
    --quiet

FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE_NAME --region=$GCP_REGION --format='value(status.url)')
print_success "Frontend: $FRONTEND_URL"

# Update NEXTAUTH_URL to frontend URL
print_step "Updating NEXTAUTH_URL"
gcloud run services update $FRONTEND_SERVICE_NAME \
    --region=$GCP_REGION \
    --update-env-vars="NEXTAUTH_URL=${FRONTEND_URL}" \
    --quiet

print_success "NEXTAUTH_URL set to: $FRONTEND_URL"

echo ""
echo -e "${GREEN}✅ DONE!${NC}"
echo ""
echo "URLs:"
echo "  User:   $USER_SERVICE_URL"
echo "  Course: $COURSE_SERVICE_URL"
echo "  App:    $FRONTEND_URL"
echo ""
echo "⚠️  Add to Google OAuth: ${FRONTEND_URL}/api/auth/callback/google"
