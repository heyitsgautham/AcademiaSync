# App Deployment Directory

This directory contains symbolic links to the application code for CI/CD deployment workflows.

## Structure

- `frontend/` → Symbolic link to `../frontend` (Next.js application)
- `backend/` → Symbolic link to `../backend` (Node.js microservices)

## Purpose

This structure ensures CI/CD workflows trigger correctly when application code changes, as specified in the AWS deployment requirements. Changes to any files within the `app-deployment/` directory (or the linked source directories) will trigger Docker image builds, security scans, and ECR pushes.

## GitHub Actions Integration

The following workflows monitor this directory:
- `.github/workflows/docker-build-push.yml` - Builds and pushes Docker images on changes to `app-deployment/**`

## Note

The actual source code remains in the root `frontend/` and `backend/` directories. This folder only contains symbolic links for deployment workflow triggers.
