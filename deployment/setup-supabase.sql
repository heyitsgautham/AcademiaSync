-- Supabase-only steps, applied by deployment/init-db.sh after backend/database/init.sql.
-- psql passes the first admin's Google account as :admin_email.

-- The services connect as the postgres role, which bypasses row level security.
-- Turning it on blocks Supabase's public anon key from reading these tables through the REST API.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- The first admin, so someone can promote teachers after the first sign-in.
INSERT INTO users (email, role, first_name, last_name)
VALUES (:'admin_email', 'Admin', 'Admin', '')
ON CONFLICT (email) DO UPDATE
SET role = 'Admin', updated_at = CURRENT_TIMESTAMP;
