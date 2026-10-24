const { logger } = require('../utils/logger');

/** JSON 404 for any route the service does not define. */
const notFoundHandler = (req, res) => {
    res.status(404).json({ error: 'Not found', message: `No route for ${req.method} ${req.path}` });
};

/**
 * Last-resort handler for errors passed to next() or thrown synchronously.
 * Body-parser errors keep their 4xx status. Anything else is logged and answered with a generic 500,
 * so database messages never reach the client.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Bad Request', message: 'Request body is not valid JSON' });
    }
    if (err.status >= 400 && err.status < 500) {
        return res.status(err.status).json({ error: 'Bad Request', message: err.message });
    }

    (req.log || logger).error({ err }, 'Unhandled error');
    return res.status(500).json({ error: 'Internal server error' });
};

module.exports = { notFoundHandler, errorHandler };
