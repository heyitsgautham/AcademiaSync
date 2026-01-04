<div align="center">

# 🎓 AcademiaSync

### Smart Learning Management System with OAuth & Role-Based Access Control

[![CI Status](https://github.com/heyitsgautham/AcademiaSync/actions/workflows/ci.yml/badge.svg)](https://github.com/heyitsgautham/AcademiaSync/actions)
[![Docker Build](https://github.com/heyitsgautham/AcademiaSync/actions/workflows/docker-build-push.yml/badge.svg)](https://github.com/heyitsgautham/AcademiaSync/actions)
[![Terraform](https://github.com/heyitsgautham/AcademiaSync/actions/workflows/terraform-deploy.yml/badge.svg)](https://github.com/heyitsgautham/AcademiaSync/actions)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![AWS](https://img.shields.io/badge/AWS-ECS%20Fargate-FF9900?logo=amazon-aws)](https://aws.amazon.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**A modern, scalable learning platform built with microservices architecture, featuring Google OAuth authentication, real-time analytics, and comprehensive course management.**

[🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [🏗️ Architecture](#️-architecture) • [📖 Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Features](#-features)
- [Architecture](#️-architecture)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#️-database-schema)
- [Deployment](#-deployment)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Environment Configuration](#-environment-configuration)
- [Documentation](#-documentation)
- [Contributing](#-contributing)

---

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** - [Download & Install](https://www.docker.com/products/docker-desktop)
- **Google OAuth Credentials** - [Setup Guide](#step-1-google-oauth-setup)
- **Git** - For cloning the repository

### Installation

#### Step 1: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Set application type to **Web application**
7. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
8. Copy your **Client ID** and **Client Secret**

#### Step 2: Clone & Configure

```bash
# Clone the repository
git clone https://github.com/heyitsgautham/AcademiaSync.git
cd AcademiaSync

# Copy environment files
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# Edit .env and frontend/.env.local with your Google OAuth credentials
```

**Required Environment Variables:**

```bash
# .env (root)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=academiasync
DB_PORT=5432
USER_SERVICE_PORT=5000
COURSE_SERVICE_PORT=5001
JWT_SECRET=<your-jwt-secret>
JWT_REFRESH_SECRET=<your-jwt-refresh-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_COURSE_SERVICE_URL=http://localhost:5001
INTERNAL_BACKEND_URL=http://user-service:5000
INTERNAL_COURSE_SERVICE_URL=http://course-service:5001
```

> 💡 **Generate NEXTAUTH_SECRET**: Run `openssl rand -base64 32` in terminal

#### Step 3: Launch with Docker

```bash
# Start all services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f
```

#### Step 4: Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 Frontend | [http://localhost:3000](http://localhost:3000) | Main application |
| 🔧 User Service | [http://localhost:5000/health](http://localhost:5000/health) | Auth & user management |
| 🔧 Course Service | [http://localhost:5001/health](http://localhost:5001/health) | Courses & assignments |
| 📊 API Docs | [http://localhost:5000/api-docs](http://localhost:5000/api-docs) | Swagger documentation |

#### Step 5: Create Admin Account

After first login with Google:

```bash
# Access the database
docker exec -it academiasync-db psql -U postgres -d academiasync

# Promote your user to admin (replace with your email)
UPDATE users SET role = 'Admin' WHERE email = 'your-email@gmail.com';
\q
```

### Stopping the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v
```

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Google OAuth 2.0** integration via NextAuth.js
- **JWT-based authentication** with access & refresh tokens
- **Role-based access control** (Student, Teacher, Admin)
- Secure **httpOnly cookies** for token storage
- Automatic **session management** and token refresh

### 👨‍🎓 Student Portal
- **Dashboard** with personalized stats and progress tracking
- **Course enrollment** and management
- **Assignment submissions** with deadline tracking
- **Analytics dashboard** with performance charts
- **Grade tracking** across all courses

### 👨‍🏫 Teacher Portal
- **Course creation** and management
- **Assignment creation** with due dates
- **Student management** by course
- **Submission grading** with feedback
- **Analytics** for student performance tracking
- **Recent activity** monitoring

### 👨‍💼 Admin Portal
- **User management** (Students & Teachers)
- **Role promotion/demotion**
- **Platform-wide analytics**
- **Course oversight**
- **System health monitoring**

### 📊 Analytics & Reporting
- **Interactive charts** using Recharts
- **Student performance** metrics
- **Course completion** rates
- **Enrollment statistics**
- **Age demographics** visualization

### 🎨 User Experience
- **Dark/Light theme** toggle with persistence
- **Responsive design** for all devices
- **Toast notifications** for user feedback
- **Confirmation modals** for critical actions
- **Loading states** and skeleton screens

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│                    Next.js 14 (App Router)                          │
│            React + TypeScript + TailwindCSS + shadcn/ui             │
│                        Port: 3000                                    │
└─────────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│       USER SERVICE          │   │      COURSE SERVICE         │
│   Express.js + Node.js      │   │   Express.js + Node.js      │
│        Port: 5000           │   │        Port: 5001           │
│                             │   │                             │
│  • Authentication (OAuth)   │   │  • Course Management        │
│  • User Management          │   │  • Assignment Management    │
│  • Admin Operations         │   │  • Enrollment Management    │
│  • JWT Token Management     │   │  • Submission Management    │
│  • Profile Management       │   │  • Student/Teacher Routes   │
└──────────────┬──────────────┘   └──────────────┬──────────────┘
               │                                  │
               └──────────────┬───────────────────┘
                              │
                              ▼
               ┌─────────────────────────────┐
               │        PostgreSQL 16        │
               │         Port: 5432          │
               │                             │
               │  • Users & Roles            │
               │  • Courses & Enrollments    │
               │  • Assignments              │
               │  • Submissions              │
               │  • Refresh Tokens           │
               └─────────────────────────────┘
```

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌─────────────┐     ┌──────────────┐
│  User    │────▶│ Frontend │────▶│  NextAuth   │────▶│    Google    │
│          │     │  :3000   │     │  OAuth      │     │   OAuth 2.0  │
└──────────┘     └──────────┘     └─────────────┘     └──────────────┘
                                         │
                                         ▼
                              ┌─────────────────┐
                              │  User Service   │
                              │   POST /auth/   │
                              │  google-signin  │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   JWT Tokens    │
                              │  (Access +      │
                              │   Refresh)      │
                              └─────────────────┘
```

### Docker Network

All services communicate via the `academiasync-network` bridge network:

| Container | Internal Hostname | External Port |
|-----------|------------------|---------------|
| Frontend | `frontend` | 3000 |
| User Service | `user-service` | 5000 |
| Course Service | `course-service` | 5001 |
| PostgreSQL | `db` | 5432 |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| ![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js) | React Framework (App Router) | 14.x |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript) | Type Safety | 5.0.x |
| ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) | UI Library | 18.x |
| ![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css) | Styling | 3.4.x |
| ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-Latest-black) | UI Components | Latest |
| ![React Query](https://img.shields.io/badge/React_Query-5.0-FF4154?logo=react-query) | Server State Management | 5.64.x |
| ![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.0-black) | Authentication | 4.x |
| ![Recharts](https://img.shields.io/badge/Recharts-2.0-8884d8) | Data Visualization | 2.x |
| ![React Hook Form](https://img.shields.io/badge/React_Hook_Form-7.0-EC5990?logo=react-hook-form) | Form Management | 7.x |
| ![Yup](https://img.shields.io/badge/Yup-1.0-orange) | Schema Validation | 1.x |
| ![next-themes](https://img.shields.io/badge/next--themes-0.3-black) | Theme Management | 0.3.x |

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js) | Runtime Environment | 20.x |
| ![Express.js](https://img.shields.io/badge/Express-4.0-black?logo=express) | Web Framework | 4.x |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql) | Database | 16.x |
| ![JWT](https://img.shields.io/badge/JWT-9.0-black?logo=json-web-tokens) | Token Authentication | 9.x |
| ![Google Auth](https://img.shields.io/badge/Google_Auth-9.0-4285F4?logo=google) | OAuth 2.0 | 9.x |
| ![Morgan](https://img.shields.io/badge/Morgan-1.10-black) | HTTP Logging | 1.10.x |
| ![Swagger](https://img.shields.io/badge/Swagger-5.0-85EA2D?logo=swagger) | API Documentation | 5.x |

### DevOps & Infrastructure

| Technology | Purpose | Version |
|------------|---------|---------|
| ![Docker](https://img.shields.io/badge/Docker-24-2496ED?logo=docker) | Containerization | 24.x |
| ![Docker Compose](https://img.shields.io/badge/Docker_Compose-2.0-2496ED?logo=docker) | Orchestration | 2.x |
| ![Terraform](https://img.shields.io/badge/Terraform-1.5-7B42BC?logo=terraform) | Infrastructure as Code | 1.5.x |
| ![AWS ECS](https://img.shields.io/badge/AWS_ECS-Fargate-FF9900?logo=amazon-aws) | Container Orchestration | Latest |
| ![AWS ECR](https://img.shields.io/badge/AWS_ECR-Registry-FF9900?logo=amazon-aws) | Container Registry | Latest |
| ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?logo=github-actions) | CI/CD Pipeline | Latest |
| ![Jest](https://img.shields.io/badge/Jest-29-C21325?logo=jest) | Testing Framework | 29.x |

---

## 📁 Project Structure

```
AcademiaSync/
├── 📁 frontend/                      # Next.js Application
│   ├── 📁 app/                       # App Router pages
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Landing page
│   │   ├── 📁 api/                   # API route handlers
│   │   │   ├── 📁 auth/[...nextauth] # OAuth configuration
│   │   │   ├── 📁 student/           # Student API routes
│   │   │   ├── 📁 teacher/           # Teacher API routes
│   │   │   └── 📁 admin/             # Admin API routes
│   │   ├── 📁 student/               # Student dashboard pages
│   │   ├── 📁 teacher/               # Teacher dashboard pages
│   │   └── 📁 admin/                 # Admin dashboard pages
│   ├── 📁 components/                # React components (60+)
│   │   ├── 📁 ui/                    # shadcn/ui base components
│   │   ├── student-*.tsx             # Student-specific components
│   │   ├── teacher-*.tsx             # Teacher-specific components
│   │   └── admin-*.tsx               # Admin-specific components
│   ├── 📁 lib/                       # Utilities & API client
│   ├── 📁 types/                     # TypeScript definitions
│   ├── middleware.ts                 # Route protection
│   └── Dockerfile                    # Multi-stage build
│
├── 📁 backend/
│   ├── 📁 user-service/              # Auth & User Management
│   │   ├── 📁 src/
│   │   │   ├── 📁 routes/            # API endpoints
│   │   │   │   ├── auth.js           # OAuth & JWT
│   │   │   │   ├── admin.js          # Admin operations
│   │   │   │   ├── dashboard.js      # Dashboard data
│   │   │   │   └── users.js          # User CRUD
│   │   │   ├── 📁 middleware/        # Auth & authorization
│   │   │   └── 📁 utils/             # HATEOAS, logging
│   │   ├── 📁 tests/                 # Jest test suites
│   │   └── Dockerfile
│   │
│   ├── 📁 course-service/            # Courses & Assignments
│   │   ├── 📁 src/
│   │   │   ├── 📁 routes/
│   │   │   │   ├── courses.js        # Course CRUD
│   │   │   │   ├── assignments.js    # Assignment CRUD
│   │   │   │   ├── student.js        # Student operations
│   │   │   │   ├── teacher.js        # Teacher operations
│   │   │   │   └── analytics.js      # Analytics data
│   │   │   └── 📁 middleware/
│   │   ├── 📁 tests/
│   │   └── Dockerfile
│   │
│   └── 📁 database/
│       ├── init.sql                  # Schema initialization
│       └── seed-demo-data.sql        # Demo data
│
├── 📁 terraform/                     # AWS Infrastructure
│   ├── main.tf                       # Root module
│   ├── variables.tf                  # Variable definitions
│   ├── outputs.tf                    # Output values
│   ├── 📁 modules/
│   │   ├── vpc/                      # VPC & networking
│   │   ├── ecr/                      # Container registry
│   │   ├── ecs/                      # ECS cluster & services
│   │   ├── cloudwatch/               # Monitoring
│   │   └── sns/                      # Notifications
│   └── deploy.sh                     # Deployment script
│
├── 📁 .github/workflows/             # CI/CD Pipelines
│   ├── ci.yml                        # Test suite
│   ├── docker-build-push.yml         # Build & push to ECR
│   └── terraform-deploy.yml          # Infrastructure deployment
│
├── 📁 deployment/                    # Deployment scripts
│   ├── deploy.sh
│   ├── init-db.sh
│   └── setup-supabase.sql
│
├── 📁 docs/                          # Additional documentation
│   ├── AWS_CONSOLE_GUIDE.md
│   └── AWS_OAUTH_FIX_EXPLAINED.md
│
├── docker-compose.yml                # Local development
├── .env.example                      # Environment template
└── README.md                         # This file
```

---

## 📚 API Documentation

### User Service (Port 5000)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/google-signin` | Google OAuth sign-in | Public |
| `POST` | `/auth/refresh` | Refresh access token | Cookie |
| `POST` | `/auth/logout` | Logout user | JWT |
| `GET` | `/profile` | Get user profile | JWT |
| `PUT` | `/profile` | Update profile | JWT |
| `GET` | `/admin/teachers` | List all teachers | Admin |
| `POST` | `/admin/teachers` | Create teacher | Admin |
| `PUT` | `/admin/teachers/:id` | Update teacher | Admin |
| `DELETE` | `/admin/teachers/:id` | Delete teacher | Admin |
| `GET` | `/admin/students` | List all students | Admin |
| `PUT` | `/admin/promote-role` | Change user role | Admin |
| `GET` | `/dashboard/stats` | Dashboard statistics | JWT |
| `GET` | `/health` | Service health check | Public |

### Course Service (Port 5001)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **Courses** |
| `GET` | `/courses` | List all courses | JWT |
| `POST` | `/courses` | Create course | Teacher |
| `PUT` | `/courses/:id` | Update course | Teacher |
| `DELETE` | `/courses/:id` | Delete course | Teacher |
| **Assignments** |
| `GET` | `/assignments/course/:id` | Get course assignments | JWT |
| `POST` | `/assignments` | Create assignment | Teacher |
| `PUT` | `/assignments/:id` | Update assignment | Teacher |
| `DELETE` | `/assignments/:id` | Delete assignment | Teacher |
| **Student Routes** |
| `GET` | `/student/courses` | Get enrolled courses | Student |
| `POST` | `/student/enroll` | Enroll in course | Student |
| `GET` | `/student/assignments` | Get assignments | Student |
| `POST` | `/student/submit` | Submit assignment | Student |
| **Teacher Routes** |
| `GET` | `/teacher/courses` | Get teacher's courses | Teacher |
| `GET` | `/teacher/students/:courseId` | Get course students | Teacher |
| `GET` | `/teacher/submissions` | Get submissions | Teacher |
| `PUT` | `/teacher/grade/:submissionId` | Grade submission | Teacher |
| **Analytics** |
| `GET` | `/analytics/student` | Student analytics | Student |
| `GET` | `/analytics/teacher` | Teacher analytics | Teacher |
| `GET` | `/analytics/admin` | Platform analytics | Admin |
| `GET` | `/health` | Service health check | Public |

### Swagger Documentation

Access interactive API documentation at: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │    courses      │       │   assignments   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ email           │◄──────│ teacher_id (FK) │       │ course_id (FK)  │──┐
│ google_id       │       │ title           │◄──────│ title           │  │
│ password_hash   │       │ description     │       │ description     │  │
│ role            │       │ weeks           │       │ due_date        │  │
│ first_name      │       │ created_at      │       │ created_at      │  │
│ last_name       │       │ updated_at      │       │ updated_at      │  │
│ age             │       └─────────────────┘       └─────────────────┘  │
│ specialization  │                                          │           │
│ profile_picture │       ┌─────────────────┐       ┌───────┴───────────┴──┐
│ created_at      │       │   enrollments   │       │    submissions       │
│ updated_at      │       ├─────────────────┤       ├──────────────────────┤
└────────┬────────┘       │ id (PK)         │       │ id (PK)              │
         │                │ student_id (FK) │──┐    │ assignment_id (FK)   │
         │                │ course_id (FK)  │  │    │ student_id (FK)      │──┐
         │                │ enrolled_at     │  │    │ submission_text      │  │
         │                └─────────────────┘  │    │ submitted_at         │  │
         │                        ▲            │    │ grade                │  │
         │                        │            │    │ feedback             │  │
         └────────────────────────┴────────────┴────┴──────────────────────┘
                                                    │
┌─────────────────┐                                 │
│ refresh_tokens  │                                 │
├─────────────────┤                                 │
│ id (PK)         │                                 │
│ user_id (FK)    │◄────────────────────────────────┘
│ token           │
│ expires_at      │
│ created_at      │
└─────────────────┘
```

### Tables Overview

| Table | Description | Key Fields |
|-------|-------------|------------|
| `users` | All platform users | role: Student/Teacher/Admin |
| `courses` | Course catalog | teacher_id links to creator |
| `enrollments` | Student-course mapping | Unique constraint on student+course |
| `assignments` | Course assignments | course_id links to parent course |
| `submissions` | Student submissions | grade & feedback fields |
| `refresh_tokens` | JWT refresh tokens | Auto-expires |

---

## 🚀 Deployment

### Local Development (Docker Compose)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### AWS Production Deployment

The application is deployable to **AWS ECS Fargate** using Terraform:

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Cloud                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                         VPC                               │   │
│  │  ┌─────────────────┐    ┌─────────────────┐             │   │
│  │  │  Public Subnet  │    │  Public Subnet  │             │   │
│  │  │     (AZ-1)      │    │     (AZ-2)      │             │   │
│  │  └────────┬────────┘    └────────┬────────┘             │   │
│  │           │                      │                        │   │
│  │           └──────────┬───────────┘                        │   │
│  │                      │                                    │   │
│  │              ┌───────▼───────┐                           │   │
│  │              │      ALB      │                           │   │
│  │              │ (Load Balancer)│                          │   │
│  │              └───────┬───────┘                           │   │
│  │                      │                                    │   │
│  │    ┌─────────────────┼─────────────────┐                 │   │
│  │    │                 │                 │                 │   │
│  │    ▼                 ▼                 ▼                 │   │
│  │ ┌──────┐       ┌──────────┐     ┌───────────┐          │   │
│  │ │ ECS  │       │   ECS    │     │    ECS    │          │   │
│  │ │Front │       │  User    │     │  Course   │          │   │
│  │ │ end  │       │ Service  │     │  Service  │          │   │
│  │ └──────┘       └──────────┘     └───────────┘          │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   ECR    │  │CloudWatch│  │   SNS    │  │ Secrets  │       │
│  │ Registry │  │  Logs    │  │  Alerts  │  │ Manager  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

#### Deployment Commands

```bash
cd terraform

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Deploy infrastructure
terraform apply

# Destroy infrastructure
terraform destroy
```

See [terraform/README.md](terraform/README.md) for detailed deployment instructions.

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

#### 1. CI Pipeline (`ci.yml`)
- **Triggers**: Push to main/develop, Pull requests
- **Jobs**: 
  - Test User Service
  - Test Course Service
  - Build Frontend

#### 2. Docker Build & Push (`docker-build-push.yml`)
- **Triggers**: Changes to `app-deployment/**`
- **Jobs**:
  - Detect changed services
  - Build Docker images
  - Run security scans (Trivy)
  - Push to AWS ECR

#### 3. Terraform Deploy (`terraform-deploy.yml`)
- **Triggers**: Changes to `terraform/**`
- **Jobs**:
  - Validate Terraform
  - Plan infrastructure changes
  - Apply changes (manual approval)

### Pipeline Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Push to   │────▶│   Run CI     │────▶│   Build &    │
│    main      │     │   Tests      │     │   Push ECR   │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
                     ┌──────────────┐     ┌──────────────┐
                     │   Deploy     │◀────│  Terraform   │
                     │   to ECS     │     │    Apply     │
                     └──────────────┘     └──────────────┘
```

---

## ⚙️ Environment Configuration

### Required Environment Variables

#### Root `.env`

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=academiasync
DB_PORT=5432

# Services
USER_SERVICE_PORT=5000
COURSE_SERVICE_PORT=5001

# JWT
JWT_SECRET=<your-jwt-secret>
JWT_REFRESH_SECRET=<your-jwt-refresh-secret>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# NextAuth
NEXTAUTH_SECRET=<generate-with-openssl>
NEXTAUTH_URL=http://localhost:3000

# Service URLs (external)
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_COURSE_SERVICE_URL=http://localhost:5001

# Service URLs (internal Docker network)
INTERNAL_BACKEND_URL=http://user-service:5000
INTERNAL_COURSE_SERVICE_URL=http://course-service:5001
```

#### Production (AWS)

For production deployment, store secrets in **AWS Secrets Manager** and reference them in terraform.tfvars:

```hcl
# terraform/terraform.tfvars
nextauth_secret      = "aws-secrets-manager-arn"
google_client_id     = "your-client-id"
google_client_secret = "aws-secrets-manager-arn"
jwt_secret           = "aws-secrets-manager-arn"
database_url         = "postgresql://..."
```

---

## 📖 Documentation

### Additional Resources

| Document | Description |
|----------|-------------|
| [AWS Console Guide](docs/AWS_CONSOLE_GUIDE.md) | AWS setup walkthrough |
| [AWS OAuth Fix](docs/AWS_OAUTH_FIX_EXPLAINED.md) | OAuth troubleshooting |
| [Terraform README](terraform/README.md) | Infrastructure deployment |
| [Copilot Instructions](.github/copilot-instructions.md) | Development conventions |

### Key Architecture Decisions

1. **Microservices Architecture**: Separation of user management and course management for independent scaling
2. **JWT + OAuth**: Hybrid authentication for security and user convenience
3. **Docker Compose for Dev**: Consistent local development environment
4. **Terraform for Prod**: Infrastructure as Code for reproducible deployments
5. **Next.js App Router**: Modern React patterns with server components
6. **shadcn/ui**: Accessible, customizable UI components

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the [Copilot Instructions](.github/copilot-instructions.md) for coding conventions
- Always use Docker for running services
- Write tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 🎓 Built with ❤️ for Education

**AcademiaSync** - Empowering Teachers, Inspiring Students

[⬆ Back to Top](#-academiasync)

---

Made with ☕ and 💻 | © 2025 AcademiaSync

</div>
