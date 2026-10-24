const { Pool } = require('pg');

/**
 * Builds the Postgres pool from the environment.
 * DATABASE_URL wins when set (Supabase and other hosted databases).
 * Otherwise the DB_* variables describe the local Docker database.
 */
const createPool = (env = process.env) => {
    if (env.DATABASE_URL) {
        return new Pool({
            connectionString: env.DATABASE_URL,
            ssl: env.DATABASE_URL.includes('supabase.com') ? { rejectUnauthorized: false } : false,
        });
    }

    return new Pool({
        host: env.DB_HOST || 'db',
        port: Number(env.DB_PORT) || 5432,
        database: env.DB_NAME || 'academiasync',
        user: env.DB_USER || 'postgres',
        password: env.DB_PASSWORD || 'postgres',
    });
};

module.exports = { createPool };
