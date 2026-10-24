const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

require('./env');

// Applies the real schema once per test run. init.sql uses IF NOT EXISTS, so re-runs are safe.
module.exports = async () => {
    const schemaPath = path.join(__dirname, '../../../database/init.sql');
    const client = new Client({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });
    await client.connect();
    try {
        await client.query(fs.readFileSync(schemaPath, 'utf8'));
    } finally {
        await client.end();
    }
};
