require('dotenv').config();

const { createPool } = require('./config/db');
const { createApp } = require('./app');
const { logger } = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const pool = createPool();
const app = createApp(pool);

// Start server only if not in test environment
let server;
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(PORT, () => {
        logger.info({ port: Number(PORT) }, 'User Service listening');
    });
}

module.exports = { app, pool, server };
