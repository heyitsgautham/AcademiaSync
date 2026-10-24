// Loaded by Jest before every test file and by the global setup.
// Defaults match the Postgres service in CI; override any of them in your shell.
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_NAME = process.env.DB_NAME || 'academiasync_test';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-access-secret';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'silent';
delete process.env.DATABASE_URL;
