require('dotenv').config();

const { createPool } = require('./config/db');
const { createApp } = require('./app');

const PORT = process.env.PORT || 5001;

const pool = createPool();
const app = createApp(pool);

// Start server only if not in test environment
let server;
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(PORT, () => {
        console.log(`Course Service running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
    });
}

module.exports = { app, pool, server };
