require('dotenv').config();

const { createPool } = require('./config/db');
const { createApp } = require('./app');
const { logger } = require('./utils/logger');
const { registerShutdown } = require('./shutdown');

const PORT = process.env.PORT || 5001;

const pool = createPool();
const app = createApp(pool);

// Start server only if not in test environment
let server;
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(PORT, () => {
        logger.info({ port: Number(PORT) }, 'Course Service listening');
    });
    registerShutdown({ server, pool, logger });
}

module.exports = { app, pool, server };
