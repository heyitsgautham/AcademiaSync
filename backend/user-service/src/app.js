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

    // Behind a load balancer or the Next.js proxy, TRUST_PROXY tells Express how many hops to trust
    // so req.ip, and with it the rate limiter, sees the client address instead of the proxy's.
    if (process.env.TRUST_PROXY) {
        const hops = Number(process.env.TRUST_PROXY);
        app.set('trust proxy', Number.isInteger(hops) ? hops : process.env.TRUST_PROXY);
    }

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
    const metrics = createMetrics({ service: 'user-service', pool, token: process.env.METRICS_TOKEN });
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
                service: 'user-service',
                timestamp: new Date().toISOString(),
                database: 'connected',
            });
        } catch (error) {
            req.log.error({ err: error }, 'Health check could not reach the database');
            res.status(503).json({
                status: 'unhealthy',
                service: 'user-service',
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

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
};

module.exports = { createApp };
