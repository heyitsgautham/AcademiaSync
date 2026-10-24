-- Demo data for AcademiaSync: 133 users, 75 courses, enrollments, assignments and graded submissions.
-- It empties every table first, so never run it against a database you want to keep.
--
-- Run it with psql from the repo root:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f backend/database/seed-demo-data.sql
-- To load it into the docker compose database, use scripts/seed-demo.sh, which streams the same files.
--
-- Each step lives in seed/ and runs in file-name order. Generated rows use modulo arithmetic on ids,
-- not random(), so every run produces the same data.

\ir seed/01-reset.sql
\ir seed/02-users.sql
\ir seed/03-courses.sql
\ir seed/04-enrollments.sql
\ir seed/05-assignments.sql
\ir seed/06-submissions.sql
\ir seed/07-summary.sql
