const crypto = require('crypto');
const client = require('prom-client');

/**
 * Route label for a finished request: the Express route pattern, such as /admin/teachers/:id,
 * so ids do not create a new time series per request. Requests no route matched share one label.
 */
const routeLabel = (req) => (req.route ? `${req.baseUrl}${req.route.path}` : 'unmatched');

/** Compares the presented bearer token with the expected one in constant time. */
const tokenMatches = (header, expected) => {
    const presented = Buffer.from(String(header || '').replace(/^Bearer\s+/i, ''));
    const wanted = Buffer.from(expected);
    return presented.length === wanted.length && crypto.timingSafeEqual(presented, wanted);
};

/**
 * Prometheus metrics for one service: Node.js process metrics, a request duration histogram
 * and the Postgres pool's connection counts, served in text format by `handler`.
 * @param {object} options
 * @param {string} options.service - Value of the service label on every series
 * @param {import('pg').Pool} options.pool - Pool whose connections are reported
 * @param {string} [options.token] - When set, /metrics requires `Authorization: Bearer <token>`
 */
const createMetrics = ({ service, pool, token }) => {
    const registry = new client.Registry();
    registry.setDefaultLabels({ service });
    client.collectDefaultMetrics({ register: registry });

    const requestDuration = new client.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Time from request start to response finish, by method, route and status code',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
        registers: [registry],
    });

    const poolConnections = new client.Gauge({
        name: 'db_pool_connections',
        help: 'Postgres pool connections by state: total, idle, or waiting clients',
        labelNames: ['state'],
        registers: [registry],
        collect() {
            this.set({ state: 'total' }, pool.totalCount);
            this.set({ state: 'idle' }, pool.idleCount);
            this.set({ state: 'waiting' }, pool.waitingCount);
        },
    });

    const middleware = (req, res, next) => {
        if (req.path === '/metrics' || req.path === '/health') return next();
        const stop = requestDuration.startTimer();
        res.on('finish', () => {
            stop({ method: req.method, route: routeLabel(req), status_code: res.statusCode });
        });
        return next();
    };

    const handler = async (req, res) => {
        if (token && !tokenMatches(req.headers.authorization, token)) {
            return res.status(401).json({ error: 'Unauthorized', message: 'A valid metrics token is required' });
        }
        res.set('Content-Type', registry.contentType);
        return res.send(await registry.metrics());
    };

    return { registry, requestDuration, poolConnections, middleware, handler };
};

module.exports = { createMetrics, routeLabel };
