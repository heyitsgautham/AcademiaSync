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
                service: 'course-service',
                timestamp: new Date().toISOString(),
                database: 'connected',
            });
        } catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                service: 'course-service',
                timestamp: new Date().toISOString(),
                database: 'disconnected',
                error: error.message,
            });
        }
    });

    // Root endpoint
    app.get('/', (req, res) => {
        res.json({
            service: 'Course Service',
            version: '1.0.0',
            description: 'Course management service for AcademiaSync',
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
            customSiteTitle: 'AcademiaSync Course Service API',
        })
    );

    // API Routes
    const coursesRouter = require('./routes/courses')(pool);
    const assignmentsRouter = require('./routes/assignments')(pool);
    const studentRouter = require('./routes/student')(pool);
    const statsRouter = require('./routes/stats')(pool);
    const teacherStudentsRouter = require('./routes/teacher-students')(pool);
    const analyticsRouter = require('./routes/analytics')(pool);
    const adminRouter = require('./routes/admin')(pool);

    app.use('/api/teacher/courses', coursesRouter);
    app.use('/api/teacher', assignmentsRouter);
    app.use('/api/student', studentRouter);
    app.use('/api/teacher/stats', statsRouter);
    app.use('/api/teacher', teacherStudentsRouter);
    app.use('/api/teacher/analytics', analyticsRouter);
    app.use('/admin', adminRouter);

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
