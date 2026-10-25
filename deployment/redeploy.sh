#!/bin/bash
set -e

SERVICE=${1:-all}

# shellcheck source=deployment/config.sh
. "$(dirname "${BASH_SOURCE[0]}")/config.sh"

gcloud config set project $GCP_PROJECT_ID --quiet

deploy_user() {
    echo "Building user-service..."
    docker build --platform linux/amd64 -t ${REGISTRY_URL}/user-service:latest -f backend/user-service/Dockerfile.cloudrun backend/user-service
    docker push ${REGISTRY_URL}/user-service:latest
    gcloud run deploy $USER_SERVICE_NAME --image=${REGISTRY_URL}/user-service:latest --region=$GCP_REGION --quiet
    echo "✓ User service updated"
}

deploy_course() {
    echo "Building course-service..."
    docker build --platform linux/amd64 -t ${REGISTRY_URL}/course-service:latest -f backend/course-service/Dockerfile.cloudrun backend/course-service
    docker push ${REGISTRY_URL}/course-service:latest
    gcloud run deploy $COURSE_SERVICE_NAME --image=${REGISTRY_URL}/course-service:latest --region=$GCP_REGION --quiet
    echo "✓ Course service updated"
}

deploy_frontend() {
    echo "Building frontend..."
    docker build --platform linux/amd64 -t ${REGISTRY_URL}/frontend:latest -f frontend/Dockerfile.cloudrun frontend
    docker push ${REGISTRY_URL}/frontend:latest
    gcloud run deploy $FRONTEND_SERVICE_NAME --image=${REGISTRY_URL}/frontend:latest --region=$GCP_REGION --quiet
    echo "✓ Frontend updated"
}

case $SERVICE in
    user*) deploy_user ;;
    course*) deploy_course ;;
    front*) deploy_frontend ;;
    all)
        deploy_user
        deploy_course
        deploy_frontend
        ;;
    *)
        echo "Usage: ./deployment/redeploy.sh [user|course|frontend|all]"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
