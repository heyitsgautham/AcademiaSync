<div align="center">

# 🎓 AcademiaSync

### Smart Learning Management System with OAuth & Role-Based Access Control

[![CI Status](https://github.com/heyitsgautham/AcademiaSync/actions/workflows/ci.yml/badge.svg)](https://github.com/heyitsgautham/AcademiaSync/actions)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**A modern, scalable learning platform built with microservices architecture, featuring Google OAuth authentication, real-time analytics, and comprehensive course management.**


</div>

---

## � Quick Start

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
cp backend/user-service/.env.example backend/user-service/.env
cp backend/course-service/.env.example backend/course-service/.env

# Edit frontend/.env.local and add your Google OAuth credentials:
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-a-random-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
INTERNAL_BACKEND_URL=http://user-service:5000
NEXT_PUBLIC_COURSE_SERVICE_URL=http://localhost:5001
INTERNAL_COURSE_SERVICE_URL=http://course-service:5001

# Backend services will use default configuration (no changes needed)
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

- 🌐 **Frontend**: [http://localhost:3000](http://localhost:3000)
- 🔧 **User Service**: [http://localhost:5000/health](http://localhost:5000/health)
- 🔧 **Course Service**: [http://localhost:5001/health](http://localhost:5001/health)

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


## 🗂️ Project Structure

```
AcademiaSync/
├── 📁 backend/
│   ├── 📁 user-service/              # Authentication & User Management
│   │   ├── 📁 src/
│   │   │   ├── index.js              # Express server entry point
│   │   │   ├── 📁 config/
│   │   │   │   └── database.js       # PostgreSQL connection pool
│   │   │   ├── 📁 middleware/
│   │   │   │   ├── auth.js           # JWT authentication middleware
│   │   │   │   └── authorize.js      # Role-based authorization
│   │   │   ├── 📁 routes/
│   │   │   │   ├── auth.js           # OAuth & JWT endpoints
│   │   │   │   ├── admin.js          # Admin-only routes
│   │   │   │   └── profile.js        # User profile management
│   │   │   └── 📁 utils/
│   │   │       ├── hateoas.js        # HATEOAS link generation
│   │   │       └── logger.js         # Morgan logger configuration
│   │   ├── 📁 tests/                 # Jest test suites
│   │   ├── 📁 logs/                  # Access logs (auto-generated)
│   │   ├── Dockerfile                # Service containerization
│   │   ├── package.json              # Dependencies
│   │   └── .env.example              # Environment template
│   │
│   ├── 📁 course-service/            # Courses, Assignments & Enrollments
│   │   ├── 📁 src/
│   │   │   ├── index.js              # Express server entry point
│   │   │   ├── 📁 config/
│   │   │   │   └── database.js       # PostgreSQL connection pool
│   │   │   ├── 📁 middleware/
│   │   │   │   └── auth.js           # JWT verification
│   │   │   ├── 📁 routes/
│   │   │   │   ├── student.js        # Student-specific routes
│   │   │   │   ├── teacher.js        # Teacher-specific routes
│   │   │   │   └── courses.js        # Course CRUD operations
│   │   │   └── 📁 utils/
│   │   │       └── hateoas.js        # HATEOAS link generation
│   │   ├── 📁 tests/                 # Jest test suites
│   │   ├── 📁 logs/                  # Access logs (auto-generated)
│   │   ├── Dockerfile                # Service containerization
│   │   ├── package.json              # Dependencies
│   │   └── .env.example              # Environment template
│   │
│   └── 📁 database/
│       └── init.sql                  # Database schema initialization
│
├── 📁 frontend/                      # Next.js Application
│   ├── 📁 app/                       # Next.js App Router
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Landing page
│   │   ├── 📁 api/                   # API route handlers
│   │   │   ├── 📁 auth/
│   │   │   │   └── [...nextauth]/    # NextAuth configuration
│   │   │   ├── 📁 student/           # Student API routes
│   │   │   ├── 📁 teacher/           # Teacher API routes
│   │   │   └── 📁 admin/             # Admin API routes
│   │   ├── 📁 student/               # Student pages
│   │   │   ├── dashboard/
│   │   │   ├── courses/
│   │   │   ├── assignments/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   ├── 📁 teacher/               # Teacher pages
│   │   │   ├── dashboard/
│   │   │   ├── courses/
│   │   │   ├── assignments/
│   │   │   ├── students/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   └── 📁 admin/                 # Admin pages
│   │       ├── dashboard/
│   │       ├── teachers/
│   │       ├── students/
│   │       ├── courses/
│   │       ├── analytics/
│   │       └── settings/
│   ├── 📁 components/                # React components
│   │   ├── ui/                       # shadcn/ui base components
│   │   ├── student-*.tsx             # Student-specific components
│   │   ├── teacher-*.tsx             # Teacher-specific components
│   │   └── admin-*.tsx               # Admin-specific components
│   ├── 📁 lib/
│   │   ├── api-client.ts             # API client with auth
│   │   └── utils.ts                  # Utility functions
│   ├── 📁 types/
│   │   └── index.ts                  # TypeScript type definitions
│   ├── middleware.ts                 # Next.js middleware for auth
│   ├── Dockerfile                    # Frontend containerization
│   ├── package.json                  # Dependencies
│   └── .env.example                  # Environment template
│
├── 📁 deployment/                    # Deployment scripts
│   ├── deploy.sh                     # Cloud deployment script
│   ├── init-db.sh                    # Database initialization
│   └── setup-supabase.sql            # Supabase setup
│
├── docker-compose.yml                # Multi-service orchestration
├── .env.example                      # Root environment template
├── .gitignore                        # Git ignore rules
└── README.md                         # This file!
```

### Key Files Description

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Defines all services, networks, and volumes |
| `backend/database/init.sql` | PostgreSQL schema with tables and relationships |
| `frontend/app/api/auth/[...nextauth]/route.ts` | OAuth configuration and JWT handling |
| `frontend/middleware.ts` | Route protection and role-based redirects |
| `backend/*/src/middleware/auth.js` | JWT validation middleware |
| `backend/*/src/utils/hateoas.js` | Self-documenting API links |

---


## 🗄️ Database Schema

### Entity Relationship Diagram

![alt text](./frontend/public/schema.png "Database Schema")

---

## 🔧 Environment Configuration

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

Default configuration:
- PostgreSQL User: `postgres`
- PostgreSQL Password: `postgres`
- Database Name: `academiasync`


---

## 🛠️ Tech Stack

<div align="center">

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| ![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js) | React Framework (App Router) | 14.x |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript) | Type Safety | 5.0.x |
| ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) | UI Library | 18.x |
| ![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css) | Styling | 3.4.x |
| ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-Latest-black) | UI Components | Latest |
| ![React Query](https://img.shields.io/badge/React_Query-5.0-FF4154?logo=react-query) | State Management | 5.64.x |
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
| ![bcryptjs](https://img.shields.io/badge/bcryptjs-2.4-red) | Password Hashing | 2.4.x |
| ![CORS](https://img.shields.io/badge/CORS-2.8-green) | Cross-Origin Resource Sharing | 2.8.x |
| ![cookie-parser](https://img.shields.io/badge/cookie--parser-1.4-orange) | Cookie Parsing | 1.4.x |

### DevOps & Infrastructure

| Technology | Purpose | Version |
|------------|---------|---------|
| ![Docker](https://img.shields.io/badge/Docker-24-2496ED?logo=docker) | Containerization | 24.x |
| ![Docker Compose](https://img.shields.io/badge/Docker_Compose-2.0-2496ED?logo=docker) | Orchestration | 2.x |
| ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?logo=github-actions) | CI/CD Pipeline | Latest |
| ![Jest](https://img.shields.io/badge/Jest-29-C21325?logo=jest) | Testing Framework | 29.x |
| ![Supertest](https://img.shields.io/badge/Supertest-6.0-green) | API Testing | 6.x |

</div>

---



### 🎓 Built with ❤️ for Education

**AcademiaSync** - Empowering Teachers, Inspiring Students

[⬆ Back to Top](#-academiasync)

---

Made with ☕ and 💻 | © 2025 AcademiaSync | [MIT License](LICENSE)

</div>
