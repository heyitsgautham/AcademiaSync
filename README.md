# AcademiaSync

[![CI](https://github.com/heyitsgautham/AcademiaSync/actions/workflows/ci.yml/badge.svg)](https://github.com/heyitsgautham/AcademiaSync/actions/workflows/ci.yml)
[![Terraform CI](https://github.com/heyitsgautham/AcademiaSync/actions/workflows/terraform-ci.yml/badge.svg)](https://github.com/heyitsgautham/AcademiaSync/actions/workflows/terraform-ci.yml)

AcademiaSync is a learning management system for three roles.
Students enroll in courses and submit assignments.
Teachers run courses, set assignments and grade submissions.
Admins manage teachers, promote users and see platform-wide numbers.

People sign in with Google.
A Next.js frontend talks to two Express services, one for users and one for courses, which share a PostgreSQL database.
The repo also holds the Docker Compose stack for local work and Terraform for an AWS ECS deployment.

## Contents

- [Features](#features)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Run it with Docker](#run-it-with-docker)
- [Run the services without Docker](#run-the-services-without-docker)
- [Tests and checks](#tests-and-checks)
- [Configuration](#configuration)
- [API](#api)
- [Database](#database)
- [Deployment](#deployment)
- [Continuous integration](#continuous-integration)

## Features

Students get a dashboard with progress per course, a course catalogue with one-click enrollment, an assignment list they can filter by course and status, and charts of their grades over time.

Teachers create and edit courses and assignments, see every enrolled student's submission for an assignment, grade one submission or a whole batch in one transaction, and get per-course analytics.

Admins list, create, edit and delete teachers and students, change anyone's role, drill into any student, teacher or course, and see ranked analytics behind an extra API key.

Every page is behind Google sign-in, and the Next.js middleware sends each role to its own section.

## Architecture

```
                 Browser
                    |
                    v
        +-----------------------+        Google OAuth
        |  frontend (Next.js)   | <----> (NextAuth.js)
        |  :3000                |
        |  pages + /api routes  |
        +-----------+-----------+
                    | server-side fetch with the user's JWT
          +---------+----------+
          v                    v
+-------------------+  +--------------------+
| user-service      |  | course-service     |
| Express, :5000    |  | Express, :5001     |
| sign-in, tokens,  |  | courses, enrollment|
| profiles, admin   |  | assignments,grading|
+---------+---------+  +----------+---------+
          |                       |
          +-----------+-----------+
                      v
             +-----------------+
             | PostgreSQL 16   |
             +-----------------+
```

Sign-in works like this.

1. NextAuth completes the Google OAuth flow in the frontend.
2. The NextAuth sign-in callback posts the Google ID token to `POST /auth/google` on user-service.
3. user-service verifies the token with Google, creates the user on first sign-in, and returns a 15-minute access JWT and a 7-day refresh JWT.
4. The frontend keeps the access token in the NextAuth session, and its `/api` route handlers forward it as a Bearer token to both services.
5. course-service verifies the same JWT with the shared `JWT_SECRET`, so it never calls user-service.

Each service is laid out the same way.

| Path | Role |
|---|---|
| `src/index.js` | Creates the pool, starts the server, handles SIGTERM |
| `src/app.js` | `createApp(pool)` wires middleware, routes and error handlers |
| `src/config/` | Database pool and Swagger spec |
| `src/routes/` | One router factory per area, larger areas split into folders |
| `src/middleware/` | JWT auth, role checks, zod validation, request logging, error handling |
| `src/schemas/` | zod schemas for every request body |
| `src/queries/` | SQL kept out of the routes, such as the admin reports and shared grade queries, tested against Postgres |
| `tests/` | Jest and Supertest suites against a real Postgres |

Both services log one JSON line per request with pino, tag each request with an `X-Request-Id`, and never return database error text to clients.
Both expose `GET /health`, which checks the database and returns 503 when it is unreachable.
Both expose `GET /metrics` in Prometheus format: Node.js process metrics, a request duration histogram labelled by method, route pattern and status code, and the Postgres pool's total, idle and waiting connections.
`docker compose --profile monitoring up -d` adds a Prometheus server on http://localhost:9090 that scrapes both services.

## Repository layout

```
backend/
  user-service/        Express API for sign-in, tokens, profiles and admin
  course-service/      Express API for courses, enrollment, assignments and grading
  database/
    init.sql           Schema, applied by the Postgres container on first start
    seed/              Demo data, split into ordered steps
    seed-demo-data.sql Loads every seed step with psql
    check-seed.sql     Data consistency checks run in CI
frontend/              Next.js 14 App Router app, NextAuth, shadcn/ui, Vitest tests
terraform/             AWS VPC, ECR, ECS Fargate, ALB, CloudWatch and SNS modules
deployment/            Scripts for the earlier Google Cloud Run and Supabase deployment
scripts/               seed-demo.sh and smoke-test.sh
docker-compose.yml     Local stack, with Prometheus behind the monitoring profile
monitoring/            Prometheus scrape config
package.json           Root scripts that install, test, lint and type-check every package
.prettierrc.json       Formatting rules shared by the backend services
```

## Run it with Docker

You need Docker with Compose v2 and a Google OAuth client.

1. In the [Google Cloud console](https://console.cloud.google.com/apis/credentials), create an OAuth client of type "Web application" and add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.

2. Create your settings file and fill in the values marked required.

   ```bash
   git clone https://github.com/heyitsgautham/AcademiaSync.git
   cd AcademiaSync
   cp .env.example .env
   ```

   Put your own Google account in `ADMIN_EMAILS` so you are an admin from your first sign-in.
   Generate each secret with `openssl rand -base64 32`.

3. Start the stack.

   ```bash
   docker compose up -d --build
   ./scripts/smoke-test.sh
   ```

   The smoke test waits until both APIs report a connected database and the frontend serves its login page.

4. Open http://localhost:3000 and sign in with Google.

Swagger UI for each service is at http://localhost:5000/api-docs and http://localhost:5001/api-docs.

To load demo data (133 users, 75 courses, about 480 enrollments, 300 assignments and 880 submissions), run `./scripts/seed-demo.sh`.
It empties every table first.

`docker compose down` stops the stack, and `docker compose down -v` also deletes the database volume.

## Run the services without Docker

You need Node.js 22 (see `.nvmrc`) and a PostgreSQL 16 server.

```bash
createdb academiasync
psql -d academiasync -f backend/database/init.sql

cd backend/user-service
cp .env.example .env      # edit DB_* and the secrets
npm ci
npm run dev               # http://localhost:5000

cd ../course-service
cp .env.example .env      # JWT_SECRET must match user-service
npm ci
npm run dev               # http://localhost:5001

cd ../../frontend
cp .env.example .env.local
npm ci
npm run dev               # http://localhost:3000
```

## Tests and checks

The backend suites run against a real Postgres database, so they exercise the actual SQL.
Before each test they truncate the tables, so point them at a throwaway database.
Jest applies `backend/database/init.sql` once per run and reads the `DB_*` variables, which default to `postgres:postgres@localhost:5432/academiasync_test`.

The root `package.json` runs each check across all three packages.

```bash
npm run setup             # npm ci in user-service, course-service and frontend
createdb academiasync_test
npm test                  # every suite: 85 + 125 backend tests, then the frontend
npm run test:coverage     # the same with each package's coverage threshold
npm run lint
npm run format:check      # Prettier, backend services
npm run typecheck         # tsc --noEmit, frontend
```

To work on one package, run the same scripts inside its folder.

```bash
cd backend/user-service
npm ci
npm test                  # 85 tests
npm run test:coverage     # fails under 75% line coverage
npm run lint
npm run format:check

cd ../course-service
npm ci
npm test                  # 125 tests
npm run test:coverage     # fails under 80% line coverage
npm run lint
npm run format:check

cd ../../frontend
npm ci
npm test                  # Vitest and Testing Library
npm run test:coverage
npm run lint              # ESLint, no warnings allowed
npm run typecheck         # tsc --noEmit
npm run build             # also type-checks and lints
```

To check the schema and the demo data against a scratch database:

```bash
psql -d scratch -v ON_ERROR_STOP=1 -f backend/database/init.sql
psql -d scratch -v ON_ERROR_STOP=1 -f backend/database/seed-demo-data.sql
psql -d scratch -v ON_ERROR_STOP=1 -f backend/database/check-seed.sql
```

## Configuration

`docker compose` reads the root `.env`, and `.env.example` documents every variable it uses.
Each service also has its own `.env.example` for running it alone.

| Variable | Used by | Purpose |
|---|---|---|
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | compose | Database credentials, passed to both services as `DB_*` |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | both services | Database connection when `DATABASE_URL` is unset |
| `DATABASE_URL` | both services | Full connection string, takes precedence, TLS is enabled for Supabase hosts |
| `JWT_SECRET` | both services | Signs and verifies access tokens, must be the same in both, and a service will not start without it |
| `JWT_REFRESH_SECRET` | user-service | Signs refresh tokens, required |
| `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY` | user-service | Token lifetimes, default `15m` and `7d` |
| `GOOGLE_CLIENT_ID` | user-service, frontend | Audience for Google ID token checks |
| `GOOGLE_CLIENT_SECRET` | frontend | OAuth client secret for NextAuth |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | frontend | NextAuth base URL and session encryption key |
| `NEXTAUTH_DEBUG` | frontend | `true` turns on NextAuth debug logs and `/debug-auth` in production builds |
| `ADMIN_EMAILS` | user-service | Comma-separated Google accounts that become Admin when they sign in |
| `LOGIN_RATE_LIMIT_MAX`, `LOGIN_RATE_LIMIT_WINDOW_MS` | user-service | Failed sign-ins allowed per IP per window before 429, default 10 per 15 minutes |
| `REFRESH_RATE_LIMIT_MAX`, `REFRESH_RATE_LIMIT_WINDOW_MS` | user-service | Failed token refreshes allowed per IP per window, default 30 per 15 minutes |
| `TRUST_PROXY` | user-service | Proxy hops to trust when reading the client IP |
| `ANALYTICS_API_KEY` | user-service, frontend | Extra key required by `GET /admin/analytics` |
| `FRONTEND_URL`, `NEXTAUTH_URL` | both services | Allowed CORS origins |
| `API_BASE_URL`, `USER_SERVICE_URL`, `COURSE_SERVICE_URL` | both services | Base URLs in hypermedia links and Swagger |
| `INTERNAL_BACKEND_URL`, `INTERNAL_COURSE_SERVICE_URL` | frontend | Service URLs for server-side requests |
| `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_COURSE_SERVICE_URL` | frontend | Service URLs for browser requests, baked in at build time |
| `PORT`, `NODE_ENV`, `LOG_LEVEL` | both services | Listen port, environment and pino log level |
| `METRICS_TOKEN` | both services | When set, `GET /metrics` requires it as a bearer token |
| `PROMETHEUS_PORT` | compose | Host port for Prometheus in the `monitoring` profile, default 9090 |

## API

Every route except sign-in, refresh, logout, `/`, `/health` and `/metrics` needs `Authorization: Bearer <access token>` or the `accessToken` cookie.
Ids in paths must be positive integers, and request bodies are validated with zod, so bad input gets a 400 with a message.

### user-service (port 5000)

| Method | Path | Role |
|---|---|---|
| POST | `/auth/google` | Public, exchanges a Google ID token for JWTs, 429 after repeated failures |
| POST | `/auth/refresh` | Refresh cookie, 429 after repeated failures |
| POST | `/auth/logout` | Any |
| GET, PUT | `/api/users/profile` | Any signed-in user |
| GET | `/student/dashboard`, `/teacher/dashboard` | Student, Teacher |
| GET | `/admin/stats`, `/admin/dashboard-analytics` | Admin |
| GET | `/admin/analytics?apiKey=...` | Admin plus `ANALYTICS_API_KEY` |
| GET, POST | `/admin/teachers` | Admin |
| PUT, DELETE | `/admin/teachers/:id` | Admin |
| GET, POST | `/admin/students` | Admin |
| PUT, DELETE | `/admin/students/:id` | Admin |
| POST | `/admin/promote-role` | Admin, to Teacher or Admin |
| POST | `/admin/change-role` | Admin, to Student, Teacher or Admin; never the caller's own role or a teacher who still owns courses |
| GET, PUT | `/admin/profile` | Admin |

### course-service (port 5001)

| Method | Path | Role |
|---|---|---|
| GET | `/api/student/available-courses`, `/api/student/courses` | Student |
| POST | `/api/student/enroll` | Student |
| GET | `/api/student/assignments`, `/api/student/assignments/:assignmentId` | Student |
| POST | `/api/student/submit-assignment` | Student |
| GET | `/api/student/dashboard`, `/api/student/analytics` | Student |
| GET, POST | `/api/teacher/courses` | Teacher |
| GET, PUT, DELETE | `/api/teacher/courses/:id` | Teacher, own courses only |
| GET, POST | `/api/teacher/courses/:courseId/assignments` | Teacher |
| GET, PUT, DELETE | `/api/teacher/assignments/:id` | Teacher |
| GET | `/api/teacher/assignments/:assignmentId/submissions` | Teacher, paged, filterable and sortable |
| PUT | `/api/teacher/submissions/:submissionId` | Teacher |
| POST | `/api/teacher/assignments/:assignmentId/submissions/bulk-grade` | Teacher |
| GET | `/api/teacher/assignments-with-status`, `/api/teacher/recent-submissions` | Teacher |
| GET | `/api/teacher/students-by-course`, `/api/teacher/stats` | Teacher |
| GET | `/api/teacher/analytics`, `/api/teacher/analytics/detailed` | Teacher |
| GET | `/admin/courses`, `/admin/recent-activity` | Admin |
| GET | `/admin/students/:studentId/courses`, `/admin/teachers/:teacherId/courses` | Admin |
| GET | `/admin/courses/:courseId/students/grades` | Admin |

## Database

`backend/database/init.sql` creates six tables, and it is safe to run more than once.

| Table | Holds |
|---|---|
| `users` | Every account, with role `Student`, `Teacher` or `Admin` |
| `courses` | Courses, each owned by a teacher |
| `enrollments` | Student to course links, unique per pair |
| `assignments` | Assignments with an optional due date |
| `submissions` | One submission per student and assignment, with grade and feedback |
| `refresh_tokens` | Issued refresh tokens, deleted on logout or expiry |

Deleting a user or course cascades to everything that depends on it.

## Deployment

The `terraform/` folder describes an AWS stack with a VPC, ECR repositories, an ECS Fargate cluster for the three containers behind an Application Load Balancer, CloudWatch alarms and an SNS topic for alerts.
See [terraform/README.md](terraform/README.md) for the variables and steps.

State is local by default.
To share it, apply `terraform/bootstrap` once, which creates a versioned, KMS-encrypted S3 bucket that refuses plain HTTP and blocks public access, a KMS-encrypted DynamoDB lock table and the key itself.
Then copy `terraform/backend.tf.example` to `terraform/backend.tf`, fill in the bootstrap outputs, and run `terraform init -migrate-state`.

The load balancer listens on plain HTTP because the stack has no domain or certificate yet.
Add an HTTPS listener with an ACM certificate before real users sign in.

The `Terraform Infrastructure Deployment` workflow runs plan, apply or destroy only when started by hand from the Actions tab.

`deployment/` holds the scripts for the earlier Google Cloud Run deployment with a Supabase database.

## Continuous integration

`ci.yml` runs on every push and pull request to `main`.

| Job | What it does |
|---|---|
| Backend (each service) | `npm ci`, ESLint, Prettier check, Jest with the coverage threshold against Postgres 16, `npm audit --audit-level=high` on production dependencies |
| Frontend | `npm ci`, ESLint, `tsc --noEmit`, Vitest with coverage, `next build`, and a report-only audit |
| Database | Applies `init.sql` twice, loads the demo seed and runs `check-seed.sql` |
| Secret scan | gitleaks over the pushed commits |

`terraform-ci.yml` runs `terraform fmt -check`, `terraform validate`, `terraform test` against a mocked AWS provider, TFLint with the AWS ruleset, Checkov, and a Trivy scan that fails on high or critical findings, whenever `terraform/` changes.
Each finding the stack accepts is skipped on its resource with a `#checkov:skip` or `#trivy:ignore` comment that says why.

`docker-build-push.yml` builds the three images and pushes them to ECR on pushes to `main` that touch their folders.

Dependabot proposes npm updates weekly and Docker, Terraform and Actions updates monthly.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow.

## License

The repository has no license file yet, so default copyright applies until one is added.
