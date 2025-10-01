# AcademiaSync

## Smart Learning Platform - Backend Infrastructure

AcademiaSync is a comprehensive learning management system with role-based access control for Students, Teachers, and Admins.

## 🏗️ Architecture

The project follows a microservices architecture:

- **User Service** (Port 5000): Handles authentication, user management, and role-based access
- **Course Service** (Port 5001): Manages courses, assignments, enrollments, and submissions
- **PostgreSQL Database** (Port 5432): Central data store for all services

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose
- Ports 5000, 5001, and 5432 available

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AcademiaSync
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Verify services are running**
   ```bash
   # Check User Service
   curl http://localhost:5000/health
   
   # Check Course Service
   curl http://localhost:5001/health
   ```

4. **View logs**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f user-service
   docker-compose logs -f course-service
   ```

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

- Default credentials are for development only
- Change passwords in production
- Use environment variables for sensitive data
- Never commit `.env` files to version control

## 📚 Tech Stack

- **Backend Framework**: Express.js (Node.js 20)
- **Database**: PostgreSQL 16
- **Containerization**: Docker & Docker Compose
- **Logging**: Morgan
- **Testing**: Jest & Supertest

## 🗺️ Roadmap

- [x] Milestone 0: Project Bootstrap & Infrastructure Setup
- [ ] Milestone 1: Authentication & Authorization
- [ ] Milestone 2: Course Management
- [ ] Milestone 3: Assignment System
- [ ] Milestone 4: Student Management
- [ ] Milestone 5: Admin Analytics
- [ ] Milestone 6: Frontend Development

## 📄 License

MIT

## 👥 Contributors

- Your Name

---

**Status**: ✅ Milestone 0 Complete - Infrastructure Ready