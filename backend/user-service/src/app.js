const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

/**
 * Builds the Express app around a Postgres pool.
 * Kept apart from index.js so tests and scripts can create the app without opening a port.
 */
const createApp = (pool) => {
    const app = express();

    // Ensure logs directory exists
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    // Create a write stream for logging
    const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });

    // Support multiple frontend origins for different environments
    const allowedOrigins = [
        'http://localhost:3000',
        'http://frontend:3000',
        process.env.FRONTEND_URL,
        process.env.NEXTAUTH_URL,
    ].filter(Boolean);

    app.use(
        cors({
            origin: allowedOrigins,
            credentials: true,
        })
    );
    app.use(express.json());
    app.use(cookieParser());
    app.use(morgan('combined', { stream: accessLogStream })); // Log to file
    app.use(morgan('dev')); // Log to console

    // Request logging middleware
    app.use((req, res, next) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.path}`);
        next();
    });

    // Health check endpoint
    app.get('/health', async (req, res) => {
        try {
            // Test database connection
            await pool.query('SELECT 1');
            res.status(200).json({
                status: 'healthy',
                service: 'user-service',
                timestamp: new Date().toISOString(),
                database: 'connected',
            });
        } catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                service: 'user-service',
                timestamp: new Date().toISOString(),
                database: 'disconnected',
                error: error.message,
            });
        }
    });

    // Root endpoint
    app.get('/', (req, res) => {
        res.json({
            service: 'User Service',
            version: '1.0.0',
            description: 'User management service for AcademiaSync',
            documentation: '/api-docs',
        });
    });

    // Swagger API Documentation
    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            explorer: true,
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'AcademiaSync User Service API',
        })
    );

    // Import and use routes
    const authRoutes = require('./routes/auth')(pool);
    const studentRoutes = require('./routes/dashboard')(pool);
    const teacherRoutes = require('./routes/teacher')(pool);
    const adminRoutes = require('./routes/admin')(pool);
    const usersRoutes = require('./routes/users')(pool);

    // Import middleware
    const checkApiKey = require('./middleware/api-key');

    // Apply API key middleware to analytics routes specifically
    app.use('/admin/analytics', checkApiKey);

    // Mount routes
    app.use('/auth', authRoutes);
    app.use('/student', studentRoutes);
    app.use('/teacher', teacherRoutes);
    app.use('/admin', adminRoutes);
    app.use('/api/users', usersRoutes);

    // Error handling middleware
    app.use((err, req, res, _next) => {
        console.error('Error:', err);
        res.status(500).json({
            error: 'Internal server error',
            message: err.message,
        });
    });

    return app;
};

module.exports = { createApp };
