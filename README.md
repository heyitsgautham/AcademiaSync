# AcademiaSync

[![CI Status](https://github.com/heyitsgautham/AcademiaSync/actions/workflows/ci.yml/badge.svg)](https://github.com/heyitsgautham/AcademiaSync/actions)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Smart Learning Platform with OAuth Authentication & RBAC

AcademiaSync is a comprehensive learning management system with Google OAuth authentication and role-based access control for Students, Teachers, and Admins.

> **📊 Project Status:** 85% Complete (B+ Grade) - [View Detailed Report](TASK_COMPLETION_REPORT.md)

## ✨ Current Status

**Internship Project - Week 2 & 3 Tasks**

### Completed Features ✅
- ✅ Google OAuth integration with NextAuth.js
- ✅ JWT-based authentication with httpOnly cookies
- ✅ Role-based access control (Student, Teacher, Admin)
- ✅ Microservices architecture (User + Course services)
- ✅ Protected dashboard routes for each role
- ✅ Request logging with Morgan
- ✅ Docker containerization
- ✅ Student management with CRUD operations
- ✅ Analytics dashboards with Recharts
- ✅ Teacher management for admins
- ✅ Responsive design with Tailwind CSS
- ✅ Theme switching (light/dark mode)
- ✅ CI/CD with GitHub Actions

### In Progress / Planned 🚧
- 🚧 API Documentation (Swagger/OpenAPI)
- 🚧 Pagination, filtering, sorting for all endpoints
- 🚧 Rate limiting middleware
- 🚧 API key authentication for analytics
- 🚧 Course recommendations endpoint
- 🚧 Session-based authentication comparison
- 🚧 HATEOAS links in API responses

> **📖 See [TASK_CHECKLIST.md](TASK_CHECKLIST.md) for detailed status and [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for step-by-step implementation of missing features.**

## 🏗️ Architecture

The project follows a microservices architecture:

- **Frontend** (Port 3000): Next.js with NextAuth.js for OAuth
- **User Service** (Port 5000): Authentication, user management, and role-based access
- **Course Service** (Port 5001): Courses, assignments, enrollments, and submissions
- **PostgreSQL Database** (Port 5432): Central data store for all services

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose

- Node.js 18+ (for local development)
- pnpm (for frontend): `npm install -g pnpm`
- Google OAuth credentials ([Setup Guide](./QUICK-START.md#step-1-get-google-oauth-credentials-2-minutes))

## 🚀 Quick Start

### Option 1: Follow the Quick Start Guide (Recommended)
See **[QUICK-START.md](./QUICK-START.md)** for a step-by-step guide to get OAuth working in 5 minutes.

### Option 2: Manual Setup


1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AcademiaSync
   ```


2. **Configure environment variables**
   ```bash
   # Backend
   cp backend/user-service/.env.example backend/user-service/.env
   # Edit and add your Google Client ID
   
   # Frontend
   cp frontend/.env.example frontend/.env.local
   # Edit and add Google OAuth credentials
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - User Service: http://localhost:5000/health
   - Course Service: http://localhost:5001/health
   

5. **Stop all services**
   ```bash
   docker-compose down
   ```

## 🗂️ Project Structure

```
AcademiaSync/
├── backend/
│   ├── user-service/
│   │   ├── src/
│   │   │   └── index.js          # Express app with health check
│   │   ├── tests/
│   │   │   └── health.test.js    # Basic sanity tests
│   │   ├── logs/                 # Service logs (persisted via volume)
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   ├── course-service/
│   │   ├── src/
│   │   │   └── index.js          # Express app with health check
│   │   ├── tests/
│   │   │   └── health.test.js    # Basic sanity tests
│   │   ├── logs/                 # Service logs (persisted via volume)
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   └── database/
│       └── init.sql               # Database schema initialization
├── docker-compose.yml
├── .gitignore
├── .env.example
└── README.md
```

## 🗄️ Database Schema

The PostgreSQL database includes the following tables:

- **users**: User accounts with roles (Student, Teacher, Admin)
- **courses**: Course information linked to teachers
- **enrollments**: Student-course relationships
- **assignments**: Course assignments
- **submissions**: Student assignment submissions with grades

See `backend/database/init.sql` for complete schema.

## 🔧 Environment Configuration

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

Default configuration:
- PostgreSQL User: `postgres`
- PostgreSQL Password: `postgres`
- Database Name: `academiasync`

## 📊 Service Endpoints

### User Service (http://localhost:5000)
- `GET /` - Service info
- `GET /health` - Health check with database status

### Course Service (http://localhost:5001)
- `GET /` - Service info
- `GET /health` - Health check with database status

## 🔍 Troubleshooting

### Port 5000 Already in Use (macOS)

On macOS, the system's Control Center may use port 5000. To resolve:

1. **Find the process using port 5000:**
   ```bash
   lsof -i :5000
   ```

2. **Kill the process (requires sudo):**
   ```bash
   sudo kill -9 <PID>
   ```

3. **Alternative: Disable AirPlay Receiver** (permanent fix)
   - Open System Preferences → Sharing
   - Uncheck "AirPlay Receiver"

### Database Connection Issues

If services can't connect to the database:

```bash
# Check if database is healthy
docker-compose ps

# Restart services
docker-compose restart user-service course-service
```

### View Service Logs

```bash
# All logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Specific service
docker-compose logs user-service
```

## 🧪 Testing

Each service includes basic sanity tests:

```bash
# User Service
cd backend/user-service
npm install
npm test

# Course Service
cd backend/course-service
npm install
npm test
```

## 🛠️ Development

### Running Services Locally (Not Recommended)

While services are designed to run in Docker, you can run them locally for development:

```bash
cd backend/user-service
npm install
npm run dev  # Requires local PostgreSQL
```

**Note:** Always use `docker-compose up` for proper multi-service orchestration.

## 📝 Logs

Service logs are persisted in:
- `backend/user-service/logs/access.log`
- `backend/course-service/logs/access.log`

Logs are automatically created and rotated by the Morgan middleware.

## 🔐 Security Notes

- JWT tokens stored in httpOnly cookies (XSS protection)
- Refresh tokens invalidated on logout
- Role-based authorization on all protected routes
- CORS configured for frontend-backend communication
- Default credentials are for development only
- Change secrets in production
- Use environment variables for sensitive data
- Never commit `.env` or `.env.local` files to version control

## 📚 Documentation

- **[EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)** - 📊 Quick overview and project status
- **[TASK_COMPLETION_REPORT.md](./TASK_COMPLETION_REPORT.md)** - 📋 Detailed analysis of all requirements
- **[TASK_CHECKLIST.md](./TASK_CHECKLIST.md)** - ✅ Quick reference checklist
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - 🔧 Step-by-step code guide for missing features
- **[QUICK-START.md](./QUICK-START.md)** - 🚀 Get started in 5 minutes
- **[MILESTONE-1-IMPLEMENTATION.md](./MILESTONE-1-IMPLEMENTATION.md)** - 📖 Authentication implementation details
- **[MILESTONE-1-SUMMARY.md](./MILESTONE-1-SUMMARY.md)** - 📑 Quick reference for Milestone 1

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js with Google OAuth
- **UI**: React 18, TypeScript, TailwindCSS, shadcn/ui
- **State Management**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form + Yup validation
- **Charts**: Recharts
- **Theme**: next-themes with dark/light mode

### Backend
- **Framework**: Express.js (Node.js 20)
- **Authentication**: JWT (jsonwebtoken) with httpOnly cookies
- **OAuth**: Google Auth Library
- **Database**: PostgreSQL 16 with pg driver
- **Logging**: Morgan (file + console)
- **Security**: bcryptjs, CORS, cookie-parser
- **Testing**: Jest & Supertest

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Services**: 4 containers (frontend, user-service, course-service, postgres)
- **Networking**: Custom Docker network for inter-service communication
- **CI/CD**: GitHub Actions for automated testing
- **Monitoring**: Morgan logs with volume persistence

## 🎓 Internship Tasks Status

### Week 2: Backend Challenge (60% Complete)

✅ **Completed:**
- Microservices architecture
- JWT authentication
- Role-based access control
- Request logging (Morgan)
- Docker containerization
- Basic REST APIs

❌ **Missing:**
- Swagger/OpenAPI documentation
- Pagination, filtering, sorting
- Rate limiting
- API key middleware
- Recommendations endpoint
- Session-based authentication
- HATEOAS links

### Week 3: Frontend Challenge (95% Complete)

✅ **Completed:**
- Google OAuth integration
- Role-based routing
- Student management (CRUD)
- Analytics dashboards
- Teacher management
- Responsive design
- Theme switching
- Form validation
- Accessibility (ARIA)

⚠️ **Needs Enhancement:**
- Backend pagination for students
- Comprehensive form validation everywhere
- Advanced table sorting

> **📖 See [TASK_CHECKLIST.md](TASK_CHECKLIST.md) for complete breakdown**

## 🗺️ Implementation Roadmap

### Phase 1 - Critical Features (Week 1)
- [ ] Swagger API documentation
- [ ] Pagination, filtering, sorting
- [ ] Rate limiting middleware
- [ ] API key authentication

**Estimated Effort:** 15-20 hours  
**Impact:** Production-ready backend

### Phase 2 - Task Completion (Week 2)
- [ ] Recommendations endpoint (async patterns)
- [ ] Session-based authentication
- [ ] HATEOAS links
- [ ] Backend pagination for students

**Estimated Effort:** 10-12 hours  
**Impact:** 100% task requirements met

### Phase 3 - Enhancement (Optional)
- [ ] Cloud deployment (AWS/GCP/Azure)
- [ ] Advanced analytics
- [ ] Performance optimization
- [ ] Security audit

**Estimated Effort:** 15-20 hours  
**Impact:** Enterprise-grade application

> **🔧 See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for step-by-step code examples**
- [ ] Assignment creation (Teachers)
- [ ] Assignment submission (Students)
- [ ] Grading interface (Teachers)
- [ ] Feedback system

### Milestone 5 - Analytics & Reporting
- [ ] Student progress tracking
- [ ] Teacher performance metrics
- [ ] Admin system-wide analytics
- [ ] Export reports

##  License

MIT

## 👥 Contributors

- Your Name

---

**Status**: ✅ Milestone 1 Complete - Authentication & RBAC Fully Implemented

