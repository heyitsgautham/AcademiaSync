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

# Load secrets from deployment/.env
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ deployment/.env file not found!${NC}"
    echo ""
    echo "Create deployment/.env with:"
    echo "  SUPABASE_DB_PASSWORD=your-password"
    echo "  JWT_SECRET=your-jwt-secret"
    echo "  JWT_REFRESH_SECRET=your-jwt-refresh-secret"
    echo "  GOOGLE_CLIENT_ID=your-google-client-id"
    echo "  GOOGLE_CLIENT_SECRET=your-google-client-secret"
    echo "  NEXTAUTH_SECRET=your-nextauth-secret"
    echo "  ANALYTICS_API_KEY=your-analytics-key"
    echo ""
    echo "Get Supabase password from: https://supabase.com/dashboard/project/bdjvbfrrohqykxuushok/settings/database"
    exit 1
fi

source "$ENV_FILE"

# Database (Supabase) - hardcoded non-sensitive config
DB_HOST=db.bdjvbfrrohqykxuushok.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres

# Get Supabase password from .env
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-${DB_PASSWORD:-}}"

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ Set SUPABASE_DB_PASSWORD in deployment/.env file!${NC}"
    echo "Get it from: https://supabase.com/dashboard/project/bdjvbfrrohqykxuushok/settings/database"
    exit 1
fi

# Validate required secrets
if [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}❌ JWT_SECRET not set in deployment/.env${NC}"
    exit 1
fi

if [ -z "$JWT_REFRESH_SECRET" ]; then
    echo -e "${RED}❌ JWT_REFRESH_SECRET not set in deployment/.env${NC}"
    exit 1
fi

if [ -z "$GOOGLE_CLIENT_ID" ]; then
    echo -e "${RED}❌ GOOGLE_CLIENT_ID not set in deployment/.env${NC}"
    exit 1
fi

if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo -e "${RED}❌ GOOGLE_CLIENT_SECRET not set in deployment/.env${NC}"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo -e "${RED}❌ NEXTAUTH_SECRET not set in deployment/.env${NC}"
    exit 1
fi

if [ -z "$ANALYTICS_API_KEY" ]; then
    echo -e "${RED}❌ ANALYTICS_API_KEY not set in deployment/.env${NC}"
    exit 1
fi

# Set defaults for JWT expiry if not provided
JWT_ACCESS_EXPIRY="${JWT_ACCESS_EXPIRY:-15m}"
JWT_REFRESH_EXPIRY="${JWT_REFRESH_EXPIRY:-7d}"

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

# Build & Push (with platform flag for Cloud Run compatibility)
print_step "Building user-service"
docker build --platform linux/amd64 -t ${REGISTRY_URL}/user-service:latest -f backend/user-service/Dockerfile.cloudrun backend/user-service
docker push ${REGISTRY_URL}/user-service:latest

print_step "Building course-service"
docker build --platform linux/amd64 -t ${REGISTRY_URL}/course-service:latest -f backend/course-service/Dockerfile.cloudrun backend/course-service
docker push ${REGISTRY_URL}/course-service:latest

print_step "Building frontend"
docker build --platform linux/amd64 -t ${REGISTRY_URL}/frontend:latest -f frontend/Dockerfile.cloudrun frontend
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

# Update backend services with cross-service URLs and CORS settings
print_step "Updating user-service with service URLs and CORS"
gcloud run services update $USER_SERVICE_NAME \
    --region=$GCP_REGION \
    --update-env-vars="API_BASE_URL=${USER_SERVICE_URL},COURSE_SERVICE_URL=${COURSE_SERVICE_URL}" \
    --quiet

print_step "Updating course-service with service URLs and CORS"
gcloud run services update $COURSE_SERVICE_NAME \
    --region=$GCP_REGION \
    --update-env-vars="API_BASE_URL=${COURSE_SERVICE_URL},USER_SERVICE_URL=${USER_SERVICE_URL}" \
    --quiet

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

# Rebuild frontend with correct URLs and redeploy
print_step "Rebuilding frontend with production URLs"
docker build --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_BACKEND_URL=${USER_SERVICE_URL} \
  --build-arg NEXT_PUBLIC_COURSE_SERVICE_URL=${COURSE_SERVICE_URL} \
  --no-cache \
  -t ${REGISTRY_URL}/frontend:latest \
  -f frontend/Dockerfile.cloudrun frontend
docker push ${REGISTRY_URL}/frontend:latest

print_step "Redeploying frontend with rebuilt image"
gcloud run deploy $FRONTEND_SERVICE_NAME \
    --image=${REGISTRY_URL}/frontend:latest \
    --region=$GCP_REGION \
    --quiet

FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE_NAME --region=$GCP_REGION --format='value(status.url)')
print_success "Frontend rebuilt and redeployed: $FRONTEND_URL"

# Update NEXTAUTH_URL to frontend URL and update CORS in backend services
print_step "Updating NEXTAUTH_URL and CORS settings"
gcloud run services update $FRONTEND_SERVICE_NAME \
    --region=$GCP_REGION \
    --update-env-vars="NEXTAUTH_URL=${FRONTEND_URL}" \
    --quiet

gcloud run services update $USER_SERVICE_NAME \
    --region=$GCP_REGION \
    --update-env-vars="FRONTEND_URL=${FRONTEND_URL},NEXTAUTH_URL=${FRONTEND_URL}" \
    --quiet

gcloud run services update $COURSE_SERVICE_NAME \
    --region=$GCP_REGION \
    --update-env-vars="FRONTEND_URL=${FRONTEND_URL},NEXTAUTH_URL=${FRONTEND_URL}" \
    --quiet

print_success "All services updated with correct URLs"

echo ""
echo -e "${GREEN}✅ DONE!${NC}"
echo ""
echo "URLs:"
echo "  User:   $USER_SERVICE_URL"
echo "  Course: $COURSE_SERVICE_URL"
echo "  App:    $FRONTEND_URL"
echo ""
echo "⚠️  Add to Google OAuth: ${FRONTEND_URL}/api/auth/callback/google"
