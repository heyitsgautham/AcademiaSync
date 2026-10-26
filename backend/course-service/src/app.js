const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { requestLogger } = require('./middleware/request-logger');
const { createMetrics } = require('./middleware/metrics');
const { notFoundHandler, errorHandler } = require('./middleware/errors');

/**
 * Builds the Express app around a Postgres pool.
 * Kept apart from index.js so tests and scripts can create the app without opening a port.
 */
const createApp = (pool) => {
    const app = express();

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
    const metrics = createMetrics({ service: 'course-service', pool, token: process.env.METRICS_TOKEN });
    app.use(requestLogger);
    app.use(metrics.middleware);
    app.use(express.json());
    app.use(cookieParser());

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
            req.log.error({ err: error }, 'Health check could not reach the database');
            res.status(503).json({
                status: 'unhealthy',
                service: 'course-service',
                timestamp: new Date().toISOString(),
                database: 'disconnected',
            });
        }
    });

    // Prometheus scrape endpoint; set METRICS_TOKEN to require a bearer token
    app.get('/metrics', metrics.handler);

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

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
};

module.exports = { createApp };
