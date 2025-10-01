# AcademiaSync


## Smart Learning Platform with OAuth Authentication & RBAC

AcademiaSync is a comprehensive learning management system with Google OAuth authentication and role-based access control for Students, Teachers, and Admins.

## ✨ Current Status

**Milestone 1: Authentication & RBAC** - ✅ COMPLETE

- Google OAuth integration with NextAuth.js
- JWT-based authentication with httpOnly cookies
- Role-based access control (Student, Teacher, Admin)
- Protected dashboard routes for each role
- Automatic token refresh
- Secure logout with token invalidation

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

- **[QUICK-START.md](./QUICK-START.md)** - Get started in 5 minutes
- **[MILESTONE-1-IMPLEMENTATION.md](./MILESTONE-1-IMPLEMENTATION.md)** - Detailed implementation guide
- **[MILESTONE-1-SUMMARY.md](./MILESTONE-1-SUMMARY.md)** - Quick reference and file structure

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js with Google OAuth
- **UI**: React, TailwindCSS, shadcn/ui
- **State Management**: React Query (planned)

### Backend
- **Framework**: Express.js (Node.js 20)
- **Authentication**: JWT (jsonwebtoken) with httpOnly cookies
- **OAuth**: Google Auth Library
- **Database**: PostgreSQL 16 with pg driver
- **Logging**: Morgan
- **Testing**: Jest & Supertest

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: (planned)
- **CI/CD**: (planned)

## 🗺️ Roadmap

### Milestone 1 - Authentication & RBAC ✅ COMPLETE
- [x] Google OAuth integration
- [x] JWT authentication with refresh tokens
- [x] Role-based access control
- [x] Protected dashboard routes
- [x] Logout with token invalidation

### Milestone 2 - Dashboard Implementation (Next)
- [ ] Student profile management
- [ ] Teacher course creation
- [ ] Admin analytics dashboard
- [ ] Real-time notifications

### Milestone 3 - Course Management
- [ ] Course CRUD operations
- [ ] Student enrollment
- [ ] Course materials upload
- [ ] Course calendar

### Milestone 4 - Assignments & Grading
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

