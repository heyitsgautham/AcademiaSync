# Contributing

This guide covers how to set up, change and check the code before you open a pull request.
The README explains what each part of the system does.

## Set up

You need Node.js 22 (the version in `.nvmrc`) and a PostgreSQL 16 server you can create databases on.
Docker is only needed to run the full stack.

```bash
git clone https://github.com/heyitsgautham/AcademiaSync.git
cd AcademiaSync
createdb academiasync_test
npm run setup    # npm ci in backend/user-service, backend/course-service and frontend
npm test         # every test suite
```

The backend tests connect with the `DB_*` variables and default to `postgres:postgres@localhost:5432/academiasync_test`.
They truncate every table before each test, so never point them at a database you want to keep.

## Make a change

Work on a branch off `main` and keep each commit to one change.
Write commit messages as `type(scope): summary`, for example `fix(course-service): reject grades above 100`.
The types in use are `feat`, `fix`, `refactor`, `test`, `docs`, `build`, `ci`, `style` and `chore`.

A bug fix lands with a test that fails without it.
A new route lands with a zod schema for its body in `src/schemas/` and tests for the accepted and rejected inputs.
New SQL goes through the route's `pool` argument with `$1` placeholders, never string concatenation of user input.

Keep source files under 500 lines.
When a router grows past that, split it into a folder with an `index.js` that registers each group, as `course-service/src/routes/student/` does.

Never commit a `.env` file or a real secret.
Add any new variable to the matching `.env.example` and to the configuration table in the README.

## Check it

Run the same checks CI runs, in the folder you changed.
From the repo root, `npm test`, `npm run test:coverage`, `npm run lint`, `npm run format:check` and `npm run typecheck` run them across every package.

| Folder | Commands |
|---|---|
| `backend/user-service`, `backend/course-service` | `npm run lint`, `npm run format:check`, `npm run test:coverage` |
| `frontend` | `npm run lint`, `npm run typecheck`, `npm run test:coverage`, `npm run build` |
| `backend/database` | `psql -d scratch -f init.sql`, then `seed-demo-data.sql` and `check-seed.sql` with `-v ON_ERROR_STOP=1` |
| `terraform` | `terraform fmt -check -recursive`, `terraform init -backend=false`, `terraform validate`, `tflint --init && tflint --recursive` |

`npm run format` fixes formatting in the backend services, which share the root `.prettierrc.json`.
The backend coverage thresholds live in each `jest.config.js`, and a run below them fails.
The frontend lint script fails above 130 warnings, and 125 already exist, mostly `any` types, so type new code fully.

## Open a pull request

Push your branch and open a pull request against `main`.
Describe what changed, why, and how you checked it.
CI must pass before merging, and the `CI Status` job reports the combined result.
