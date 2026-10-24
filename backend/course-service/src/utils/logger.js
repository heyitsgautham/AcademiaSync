const pino = require('pino');

/**
 * JSON logger shared by the whole service.
 * LOG_LEVEL overrides the level, and tests default to silent.
 */
const logger = pino({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'silent' : 'info'),
    base: { service: 'course-service' },
    redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
        censor: '[redacted]',
    },
});

module.exports = { logger };
