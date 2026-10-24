const { randomUUID } = require('crypto');
const pinoHttp = require('pino-http');
const { logger } = require('../utils/logger');

/**
 * Logs one JSON line per request and attaches req.log for handlers.
 * Reuses an incoming X-Request-Id so a request can be traced from the frontend through both services.
 */
const requestLogger = pinoHttp({
    logger,
    genReqId: (req, res) => {
        const id = req.headers['x-request-id'] || randomUUID();
        res.setHeader('X-Request-Id', id);
        return id;
    },
    customLogLevel: (req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
    },
    autoLogging: { ignore: (req) => req.url === '/health' },
});

module.exports = { requestLogger };
