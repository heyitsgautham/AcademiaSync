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

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Documentation](#-documentation)

</div>

---


## ✨ Features

### 🔐 Authentication & Authorization
- **Google OAuth 2.0 Integration** - Seamless sign-in with Google accounts via NextAuth.js
- **JWT-Based Authentication** - Secure token management with access and refresh tokens
- **httpOnly Cookies** - XSS-protected token storage
- **Role-Based Access Control (RBAC)** - Three distinct roles: Student, Teacher, and Admin
- **Protected Routes** - Automatic role-based route protection and redirection
- **Session Management** - Secure session handling with automatic token refresh

### 👨‍🎓 Student Features
- **📚 Course Enrollment** - Browse and enroll in available courses
- **📝 Assignment Management**
  - View all assignments across enrolled courses
  - Submit assignments with file attachments
  - Track submission status (pending, submitted, graded)
  - View grades and feedback from teachers
- **📊 Personal Dashboard**
  - Overview of enrolled courses and pending assignments
  - Recent activity timeline
  - Course progress tracking
  - Performance analytics with interactive charts
- **📈 Analytics & Insights**
  - Personal grade distribution visualization
  - Course-wise progress tracking (Pie & Bar charts)
  - Submission status overview
  - Performance trends over time
- **⚙️ Profile Management**
  - Update personal information
  - View enrollment history
  - Manage notification preferences
  - Customize dashboard preferences

### 👨‍🏫 Teacher Features
- **📖 Course Management**
  - Create, edit, and delete courses
  - Set course descriptions and details
  - View enrolled students per course
  - Archive/unarchive courses
- **✏️ Assignment Creation & Management**
  - Create assignments with deadlines and descriptions
  - Set maximum points and grading criteria
  - Edit or delete assignments
  - Filter assignments by course and status
  - Bulk operations support
- **📋 Submission Review & Grading**
  - View all student submissions
  - Grade assignments with detailed feedback
  - Bulk grading interface
  - Track submission status (submitted, pending, graded)
  - Download student submissions
  - Sort and filter submissions
- **👥 Student Management**
  - View all enrolled students by course
  - Filter and search students
  - View student performance details
  - Track individual student progress
  - Access student submission history
- **� Advanced Analytics**
  - Course performance metrics
  - Student engagement statistics
  - Assignment completion rates
  - Grade distribution charts
  - Time-filtered analytics (weekly, monthly, yearly)
  - Top-performing students insights
  - Submission trends visualization
- **📈 Dashboard Insights**
  - Total courses and student count
  - Pending submissions overview
  - Recent activity feed
  - Quick access to grading queue

### 👨‍💼 Admin Features
- **👤 User Management**
  - **Teacher Management**
    - Create, edit, and delete teacher accounts
    - Assign specializations
    - View teacher performance metrics
    - Track courses per teacher
    - Monitor student-to-teacher ratios
  - **Student Management**
    - CRUD operations for student accounts
    - Bulk student operations
    - View student enrollment details
    - Track student performance
    - Filter and search capabilities
- **� System-Wide Course Oversight**
  - View all courses across the platform
  - Monitor course enrollment statistics
  - Track assignment submission rates
  - Course performance analytics
- **� Comprehensive Analytics Dashboard**
  - **Student Analytics**
    - Total student count
    - Students by age distribution (Bar chart)
    - Students per teacher metrics (Bar chart)
    - Top-performing students (Table with grades)
  - **Teacher Analytics**
    - Total teacher count
    - Teachers by student count (Bar chart)
    - Teacher performance metrics
    - Specialization distribution
  - **Course Analytics**
    - Total courses count
    - Top courses by average grade (Bar chart)
    - Enrollment trends
    - Submission statistics
  - **System Metrics**
    - Total assignments created
    - Overall submission rates
    - Platform-wide grade averages
    - Recent activity monitoring
- **⚙️ System Settings**
  - Platform configuration
  - User role promotion/demotion
  - System-wide notifications
  - Security settings

### 🎨 User Experience
- **🌓 Dark/Light Theme Toggle** - System-wide theme switching with localStorage persistence
- **📱 Responsive Design** - Fully optimized for mobile, tablet, and desktop
- **♿ Accessibility** - ARIA labels, semantic HTML, and keyboard navigation
- **🎯 Interactive Charts** - Recharts-powered data visualization
  - Bar charts with wrapped labels
  - Pie charts with percentage displays
  - Responsive chart containers
  - Theme-aware color schemes
- **🔔 Toast Notifications** - Real-time feedback for all user actions
- **✅ Form Validation** - React Hook Form + Yup schema validation
- **🔄 Optimistic Updates** - React Query for smooth data mutations
- **💨 Loading States** - Skeleton loaders and loading indicators
- **🎭 Modal Dialogs** - Confirmation modals for critical actions
- **🔍 Search & Filter** - Advanced filtering across all data tables
- **📄 Pagination** - Efficient data loading with pagination controls
- **↕️ Sorting** - Multi-column sorting capabilities

### 🏗️ Technical Features
- **🐳 Docker Containerization** - Fully containerized application stack
- **🔄 Microservices Architecture** - Separate User and Course services
- **🗄️ PostgreSQL Database** - Robust relational database with foreign keys
- **📝 Request Logging** - Morgan middleware for access logs
- **🔗 HATEOAS API Design** - Hypermedia-driven RESTful APIs
- **🔒 Security Best Practices**
  - CORS configuration
  - SQL injection prevention
  - Rate limiting ready
  - Environment variable secrets
- **🧪 Automated Testing** - Jest & Supertest for backend testing
- **🚀 CI/CD Pipeline** - GitHub Actions for automated testing and deployment
- **📊 API Documentation Ready** - Swagger/OpenAPI compatible structure

---


## 🏗️ Architecture

<div align="center">

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Port 3000)                      │
│                    Next.js + NextAuth + React Query              │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Student   │  │   Teacher    │  │    Admin     │           │
│  │  Dashboard  │  │  Dashboard   │  │  Dashboard   │           │
│  └─────────────┘  └──────────────┘  └──────────────┘           │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ HTTP/REST API (JWT in Authorization header)
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐              ┌──────▼──────────┐
│  User Service  │              │ Course Service  │
│   (Port 5000)  │              │   (Port 5001)   │
│                │              │                 │
│  • Auth & JWT  │              │  • Courses      │
│  • Users CRUD  │              │  • Assignments  │
│  • Roles       │              │  • Enrollments  │
│  • Teachers    │              │  • Submissions  │
│  • Students    │              │  • Grading      │
└────────┬───────┘              └────────┬────────┘
         │                               │
         │                               │
         └───────────┬───────────────────┘
                     │
                     │ TCP/IP Connection
                     │
            ┌────────▼────────┐
            │   PostgreSQL    │
            │   (Port 5432)   │
            │                 │
            │  • users        │
            │  • courses      │
            │  • enrollments  │
            │  • assignments  │
            │  • submissions  │
            └─────────────────┘
```

</div>

### Architecture Highlights

- **🔄 Microservices Pattern**: Separate User and Course services for scalability
- **🌐 Docker Networking**: Custom bridge network for inter-service communication
- **🔐 JWT Authentication**: Centralized auth in User Service, validated across all services
- **📊 Shared Database**: PostgreSQL as central data store with normalized schema
- **🚀 API Gateway Pattern**: Frontend acts as API gateway, routing requests to services
- **🔗 HATEOAS Links**: Self-documenting APIs with hypermedia controls

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

```
┌─────────────┐
│    users    │
├─────────────┤
│ id (PK)     │────┐
│ email       │    │
│ first_name  │    │
│ last_name   │    │
│ role        │    │
│ profile_pic │    │
│ created_at  │    │
└─────────────┘    │
                   │
                   │ teacher_id (FK)
                   │
                   ▼
            ┌─────────────┐
            │   courses   │
            ├─────────────┤
            │ id (PK)     │────┐
            │ teacher_id  │◄───┘
            │ title       │
            │ description │
            │ created_at  │
            └─────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         │ course_id (FK)    │ course_id (FK)
         ▼                   ▼
   ┌─────────────┐    ┌─────────────┐
   │ enrollments │    │ assignments │
   ├─────────────┤    ├─────────────┤
   │ id (PK)     │    │ id (PK)     │────┐
   │ student_id  │    │ course_id   │    │
   │ course_id   │    │ title       │    │
   │ enrolled_at │    │ description │    │
   └─────────────┘    │ due_date    │    │
         ▲            │ max_points  │    │
         │            │ created_at  │    │
         │            └─────────────┘    │
         │                               │
         │ student_id (FK)               │ assignment_id (FK)
         │                               │
         │            ┌─────────────┐    │
         └────────────│ submissions │◄───┘
                      ├─────────────┤
                      │ id (PK)     │
                      │ assignment_id│
                      │ student_id  │
                      │ content     │
                      │ grade       │
                      │ feedback    │
                      │ submitted_at│
                      └─────────────┘
```

### Tables Description

#### `users`
Stores all user accounts (Students, Teachers, Admins)

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| email | VARCHAR(255) | Unique email (OAuth) |
| first_name | VARCHAR(100) | First name |
| last_name | VARCHAR(100) | Last name |
| role | VARCHAR(20) | Student/Teacher/Admin |
| specialization | VARCHAR(100) | Teacher specialization |
| date_of_birth | DATE | User's DOB |
| profile_picture | TEXT | Profile image URL |
| created_at | TIMESTAMP | Account creation date |

#### `courses`
Course information created by teachers

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| teacher_id | INTEGER | FK to users(id) |
| title | VARCHAR(255) | Course title |
| description | TEXT | Course description |
| created_at | TIMESTAMP | Creation date |

#### `enrollments`
Student-course relationships

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| student_id | INTEGER | FK to users(id) |
| course_id | INTEGER | FK to courses(id) |
| enrolled_at | TIMESTAMP | Enrollment date |

#### `assignments`
Assignments created for courses

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| course_id | INTEGER | FK to courses(id) |
| title | VARCHAR(255) | Assignment title |
| description | TEXT | Assignment description |
| due_date | TIMESTAMP | Submission deadline |
| max_points | INTEGER | Maximum points |
| created_at | TIMESTAMP | Creation date |

#### `submissions`
Student assignment submissions

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| assignment_id | INTEGER | FK to assignments(id) |
| student_id | INTEGER | FK to users(id) |
| content | TEXT | Submission content |
| grade | INTEGER | Grade (nullable) |
| feedback | TEXT | Teacher feedback |
| submitted_at | TIMESTAMP | Submission time |

> See `backend/database/init.sql` for complete schema with constraints and indexes

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


## 📊 API Endpoints

### User Service (Port 5000)

#### Authentication
```http
POST   /auth/google              # Google OAuth login
POST   /auth/refresh              # Refresh JWT token
POST   /auth/logout               # Logout and clear tokens
GET    /auth/me                   # Get current user info
```

#### Profile
```http
GET    /profile                   # Get user profile
PUT    /profile                   # Update user profile
```

#### Admin Endpoints
```http
GET    /admin/teachers            # List all teachers
POST   /admin/teachers            # Create teacher
PUT    /admin/teachers/:id        # Update teacher
DELETE /admin/teachers/:id        # Delete teacher
GET    /admin/students            # List all students (paginated)
POST   /admin/students            # Create student
DELETE /admin/students/:id        # Delete student
GET    /admin/analytics           # System-wide analytics
GET    /admin/dashboard-analytics # Dashboard charts data
POST   /admin/promote-role        # Promote user role
```

### Course Service (Port 5001)

#### Student Endpoints
```http
GET    /student/dashboard         # Student dashboard data
GET    /student/courses           # Enrolled courses
GET    /student/available-courses # Browse courses
POST   /student/courses/:id/enroll # Enroll in course
GET    /student/assignments       # All assignments
GET    /student/assignments/:id   # Assignment details
POST   /student/assignments/:id/submit # Submit assignment
GET    /student/analytics         # Student analytics
```

#### Teacher Endpoints
```http
GET    /teacher/dashboard         # Teacher dashboard data
GET    /teacher/stats             # Teacher statistics
GET    /teacher/courses           # Teacher's courses
POST   /teacher/courses           # Create course
PUT    /teacher/courses/:id       # Update course
DELETE /teacher/courses/:id       # Delete course
GET    /teacher/courses/:id/assignments # Course assignments
POST   /teacher/courses/:id/assignments # Create assignment
PUT    /teacher/assignments/:id   # Update assignment
DELETE /teacher/assignments/:id   # Delete assignment
GET    /teacher/assignments/:id/submissions # View submissions
POST   /teacher/assignments/:id/submissions/:studentId/grade # Grade submission
GET    /teacher/students-by-course # Students by course
GET    /teacher/analytics         # Teacher analytics
```

### Response Format

All endpoints return JSON with HATEOAS links:

```json
{
  "data": { /* resource data */ },
  "_links": [
    {
      "rel": "self",
      "href": "http://localhost:5001/student/courses/1",
      "method": "GET",
      "description": "Get course details"
    },
    {
      "rel": "enroll",
      "href": "http://localhost:5001/student/courses/1/enroll",
      "method": "POST",
      "description": "Enroll in course"
    }
  ]
}
```

---


## 🔍 Troubleshooting

### Common Issues

#### 1. Port 5000 Already in Use (macOS)

macOS AirPlay Receiver uses port 5000 by default.

**Solution 1: Disable AirPlay Receiver (Permanent)**
```
System Preferences → Sharing → Uncheck "AirPlay Receiver"
```

**Solution 2: Kill the process**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process (replace <PID>)
sudo kill -9 <PID>
```

#### 2. Database Connection Failed

**Symptoms**: Services can't connect to PostgreSQL

**Solutions**:
```bash
# Check database health
docker-compose ps

# Restart database
docker-compose restart db

# Restart all services
docker-compose restart

# Check database logs
docker-compose logs db
```

#### 3. OAuth Login Not Working

**Symptoms**: Redirect errors or "Sign in with Google" fails

**Solutions**:
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `frontend/.env.local`
- Check redirect URI in Google Console matches: `http://localhost:3000/api/auth/callback/google`
- Ensure `NEXTAUTH_URL=http://localhost:3000` in `.env.local`
- Restart frontend: `docker-compose restart frontend`

#### 4. "Cannot find module" Errors

**Symptoms**: Node module errors in logs

**Solutions**:
```bash
# Rebuild with fresh dependencies
docker-compose down
docker-compose up -d --build

# For specific service
docker-compose up -d --build frontend
```

#### 5. Database Schema Mismatch

**Symptoms**: SQL errors about missing columns/tables

**Solutions**:
```bash
# Reset database (⚠️ deletes all data)
docker-compose down -v
docker-compose up -d

# Or manually re-initialize
docker exec -i academiasync-db psql -U postgres -d academiasync < backend/database/init.sql
```

#### 6. Frontend Not Loading / White Screen

**Symptoms**: Blank page or loading forever

**Solutions**:
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up -d --build frontend

# Check browser console for errors (F12)
# Verify .env.local has all required variables
```

#### 7. CORS Errors

**Symptoms**: "CORS policy" errors in browser console

**Solutions**:
- Ensure backend CORS allows `http://localhost:3000`
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
- Verify services are running: `docker-compose ps`

#### 8. Session/Token Expired

**Symptoms**: Logged out unexpectedly or 401 errors

**Solutions**:
- Sign out and sign back in
- Clear browser cookies for `localhost:3000`
- Check JWT_SECRET matches across services

### Debugging Commands

```bash
# Check all services status
docker-compose ps

# View real-time logs
docker-compose logs -f

# Check specific service logs
docker-compose logs frontend | tail -50
docker-compose logs user-service | tail -50

# Restart single service
docker-compose restart <service-name>

# Check network connectivity
docker exec frontend ping user-service
docker exec frontend ping course-service

# Access service shell
docker exec -it academiasync-frontend sh
docker exec -it academiasync-user-service sh

# Check environment variables in container
docker exec academiasync-frontend env | grep NEXT
```

### Getting Help

If issues persist:

1. Check logs: `docker-compose logs -f`
2. Verify all environment variables are set correctly
3. Try clean rebuild: `docker-compose down -v && docker-compose up -d --build`
4. Check [GitHub Issues](https://github.com/heyitsgautham/AcademiaSync/issues)
5. Create a new issue with logs and error messages

---


## 🧪 Testing

### Backend Testing

The backend services use **Jest** and **Supertest** for testing.

```bash
# Test User Service
cd backend/user-service
npm install
npm test

# Test Course Service
cd backend/course-service
npm install
npm test

# Run with coverage
npm test -- --coverage
```

### Test Structure

```
backend/user-service/tests/
├── health.test.js          # Health endpoint tests
├── auth.test.js            # Authentication tests
└── admin.test.js           # Admin endpoint tests

backend/course-service/tests/
├── health.test.js          # Health endpoint tests
├── courses.test.js         # Course CRUD tests
└── assignments.test.js     # Assignment tests
```

### CI/CD Pipeline

GitHub Actions automatically runs tests on:
- Push to `main` branch
- Pull request creation
- Pull request updates

View workflow: `.github/workflows/ci.yml`

```yaml
# CI runs:
- Linting
- Unit tests
- Integration tests
- Docker build validation
```

---


## � Development

### Local Development Setup

For development without Docker:

#### Backend Services

```bash
# User Service
cd backend/user-service
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev

# Course Service
cd backend/course-service
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

#### Frontend

```bash
cd frontend
pnpm install
cp .env.example .env.local
# Edit .env.local with OAuth credentials
pnpm dev
```

> ⚠️ **Note**: Docker Compose is recommended for consistent multi-service orchestration

### Environment Variables

#### Frontend (.env.local)
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
INTERNAL_BACKEND_URL=http://user-service:5000
NEXT_PUBLIC_COURSE_SERVICE_URL=http://localhost:5001
INTERNAL_COURSE_SERVICE_URL=http://course-service:5001
```

#### Backend Services (.env)
```bash
PORT=5000  # or 5001 for course-service
DATABASE_URL=postgres://postgres:postgres@localhost:5432/academiasync
JWT_SECRET=<your-jwt-secret>
JWT_REFRESH_SECRET=<your-refresh-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
```

### Testing

```bash
# Backend Tests
cd backend/user-service
npm test

cd backend/course-service
npm test

# Frontend Tests (if configured)
cd frontend
pnpm test
```

### Viewing Logs

```bash
# Real-time logs
docker-compose logs -f

# Specific service
docker-compose logs -f user-service
docker-compose logs -f course-service
docker-compose logs -f frontend

# Persisted log files
cat backend/user-service/logs/access.log
cat backend/course-service/logs/access.log
```

### Database Management

```bash
# Access PostgreSQL CLI
docker exec -it academiasync-db psql -U postgres -d academiasync

# Common queries
\dt                                    # List tables
\d users                               # Describe users table
SELECT * FROM users;                   # View all users
UPDATE users SET role='Admin' WHERE email='your@email.com';  # Promote to admin
\q                                     # Quit

# Backup database
docker exec academiasync-db pg_dump -U postgres academiasync > backup.sql

# Restore database
docker exec -i academiasync-db psql -U postgres academiasync < backup.sql
```

### Rebuilding Services

```bash
# Rebuild all services
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build frontend
docker-compose up -d --build user-service

# Clean rebuild (remove volumes)
docker-compose down -v
docker-compose up -d --build
```

---

## 📝 Logs

Service logs are persisted in:
- `backend/user-service/logs/access.log`
- `backend/course-service/logs/access.log`

Logs are automatically created and rotated by the Morgan middleware.


## 🔐 Security

### Authentication & Authorization

- **OAuth 2.0** - Google authentication via NextAuth.js
- **JWT Tokens** - Secure access and refresh token system
- **httpOnly Cookies** - XSS attack prevention
- **Role-Based Access Control** - Three-tier permission system (Student, Teacher, Admin)
- **Protected Routes** - Automatic middleware-based route protection

### Best Practices Implemented

✅ **Password Security**
- Passwords hashed with bcrypt (salt rounds: 10)
- No plain text password storage

✅ **Token Security**
- Short-lived access tokens (1 hour)
- Refresh tokens with rotation
- Secure token validation on every request

✅ **SQL Injection Prevention**
- Parameterized queries using pg placeholders
- No string concatenation in SQL

✅ **XSS Protection**
- httpOnly cookies prevent JavaScript access
- Input sanitization on backend
- Content Security Policy headers

✅ **CORS Configuration**
- Restricted origins (localhost only in dev)
- Credentials allowed for same-origin
- Pre-flight request handling

✅ **Environment Variables**
- All secrets in .env files
- .env files in .gitignore
- Example templates provided

### Production Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets (`openssl rand -base64 32`)
- [ ] Use HTTPS/TLS certificates
- [ ] Update CORS to production domain
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerts
- [ ] Regular dependency updates
- [ ] Enable PostgreSQL SSL
- [ ] Use environment-specific configs
- [ ] Set secure cookie flags (secure, sameSite)
- [ ] Implement API rate limiting
- [ ] Add request size limits
- [ ] Enable audit logging
- [ ] Set up backup systems

### Reporting Security Issues

If you discover a security vulnerability, please email: **security@example.com**

Do not open public issues for security vulnerabilities.

---


## 📚 Documentation

### Main Documentation

| Document | Description |
|----------|-------------|
| [QUICK-START.md](./QUICK-START.md) | 🚀 Get started in 5 minutes |
| [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md) | 📊 Quick overview and project status |
| [TASK_COMPLETION_REPORT.md](./TASK_COMPLETION_REPORT.md) | 📋 Detailed analysis of all requirements |
| [TASK_CHECKLIST.md](./TASK_CHECKLIST.md) | ✅ Quick reference checklist |
| [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) | 🔧 Step-by-step code guide |

### Milestone Documentation

| Document | Description |
|----------|-------------|
| [MILESTONE-1-IMPLEMENTATION.md](./MILESTONE-1-IMPLEMENTATION.md) | 📖 Authentication implementation details |
| [MILESTONE-1-SUMMARY.md](./MILESTONE-1-SUMMARY.md) | 📑 Quick reference for Milestone 1 |

### API Documentation

- **Health Checks**: `GET /health` on all services
- **HATEOAS**: All responses include `_links` for discoverability
- **Swagger**: (Coming soon) OpenAPI documentation

### Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Guide](https://next-auth.js.org/getting-started/introduction)
- [React Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/)

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

### Architecture Components

```yaml
Frontend Architecture:
  - App Router (Next.js 14)
  - Server Components for SEO
  - Client Components for interactivity
  - API Routes for backend communication
  - Middleware for auth protection

Backend Architecture:
  - Microservices (User Service + Course Service)
  - RESTful API design with HATEOAS
  - JWT authentication with refresh tokens
  - PostgreSQL with normalized schema
  - Docker network for service communication

Security:
  - OAuth 2.0 (Google)
  - JWT with httpOnly cookies
  - CORS protection
  - SQL injection prevention (parameterized queries)
  - XSS protection
  - Environment variable secrets
```

---


## � Project Status & Roadmap

### ✅ Completed Features (95%)

#### Authentication & Core (100%)
- ✅ Google OAuth 2.0 integration
- ✅ JWT authentication system
- ✅ Role-based access control
- ✅ Protected route middleware
- ✅ Session management

#### Student Features (100%)
- ✅ Course enrollment system
- ✅ Assignment submission
- ✅ Personal dashboard
- ✅ Analytics & insights
- ✅ Profile management

#### Teacher Features (100%)
- ✅ Course CRUD operations
- ✅ Assignment creation & management
- ✅ Submission review & grading
- ✅ Student management by course
- ✅ Advanced analytics dashboard

#### Admin Features (100%)
- ✅ Teacher management (CRUD)
- ✅ Student management (CRUD)
- ✅ System-wide course oversight
- ✅ Comprehensive analytics
- ✅ Role promotion system

#### UI/UX (100%)
- ✅ Dark/Light theme toggle
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Accessibility (ARIA, keyboard nav)
- ✅ Interactive charts (Recharts)
- ✅ Toast notifications
- ✅ Form validation
- ✅ Loading states & skeletons

#### Technical (90%)
- ✅ Docker containerization
- ✅ Microservices architecture
- ✅ PostgreSQL database
- ✅ Request logging
- ✅ HATEOAS API design
- ✅ CI/CD pipeline
- ✅ Automated testing
- � API documentation (Swagger)

### 🚧 In Progress / Planned (5%)

#### Backend Enhancements
- 🚧 Complete Swagger/OpenAPI documentation
- 🚧 Advanced rate limiting middleware
- 🚧 API key authentication for analytics endpoints
- 🚧 Course recommendation algorithm (ML-based)

#### Advanced Features
- 🚧 Real-time notifications (WebSocket)
- 🚧 File upload system for assignments
- 🚧 Batch operations for grading
- 🚧 Export reports (PDF/CSV)

#### Infrastructure
- 🚧 Cloud deployment scripts (AWS/GCP/Azure)
- 🚧 Performance monitoring (Prometheus/Grafana)
- 🚧 Load balancing configuration
- 🚧 Database replication

### 🗺️ Roadmap

#### Phase 1: Polish & Documentation (Current)
**Timeline**: 1-2 weeks  
**Focus**: Complete API docs, improve error handling

- [ ] Swagger UI implementation
- [ ] Comprehensive error messages
- [ ] Advanced pagination
- [ ] API rate limiting

#### Phase 2: Advanced Features
**Timeline**: 2-3 weeks  
**Focus**: Real-time features, file handling

- [ ] WebSocket notifications
- [ ] File upload/download system
- [ ] Batch grading interface
- [ ] Advanced search & filters

#### Phase 3: Production Ready
**Timeline**: 2-3 weeks  
**Focus**: Cloud deployment, monitoring

- [ ] Cloud deployment (AWS/GCP)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Monitoring & alerting

#### Phase 4: Scale & Enhance (Future)
**Timeline**: Ongoing  
**Focus**: ML features, analytics

- [ ] Course recommendations (ML)
- [ ] Predictive analytics
- [ ] Advanced reporting
- [ ] Mobile app (React Native)

---


## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure Docker builds pass (`docker-compose up -d --build`)

### Code Style

- **Frontend**: TypeScript, ESLint, Prettier
- **Backend**: JavaScript ES6+, consistent naming
- **Database**: Snake_case for columns, PascalCase for tables

### Pull Request Process

1. Update README.md with details of changes (if applicable)
2. Ensure all tests pass
3. Update documentation
4. Request review from maintainers

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- ✅ Test coverage
- 🌐 Internationalization (i18n)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 AcademiaSync

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 👥 Team

### Maintainer
- **Gautham Krishna** - *Lead Developer* - [@heyitsgautham](https://github.com/heyitsgautham)

### Acknowledgments

- Next.js team for the amazing framework
- Vercel for shadcn/ui components
- PostgreSQL community
- Docker for containerization
- All open-source contributors

---

## 📞 Support

### Getting Help

- 📖 Check the [Documentation](#-documentation)
- 🐛 Report bugs via [GitHub Issues](https://github.com/heyitsgautham/AcademiaSync/issues)
- 💬 Ask questions in [Discussions](https://github.com/heyitsgautham/AcademiaSync/discussions)
- 📧 Email: support@academiasync.example.com

### Useful Links

- [Project Homepage](https://github.com/heyitsgautham/AcademiaSync)
- [Issue Tracker](https://github.com/heyitsgautham/AcademiaSync/issues)
- [Changelog](./CHANGELOG.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

---

## ⭐ Star History

If you find this project helpful, please consider giving it a star! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=heyitsgautham/AcademiaSync&type=Date)](https://star-history.com/#heyitsgautham/AcademiaSync&Date)

---

<div align="center">

### 🎓 Built with ❤️ for Education

**AcademiaSync** - Empowering Teachers, Inspiring Students

[⬆ Back to Top](#-academiasync)

---

Made with ☕ and 💻 | © 2025 AcademiaSync | [MIT License](LICENSE)

</div>