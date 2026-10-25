const { rateLimit } = require('express-rate-limit');

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const positiveInt = (value, fallback) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Brute-force guard for an auth route.
 * Only failed attempts (any 4xx or 5xx) count, because sign-in requests arrive from the Next.js server
 * and share its IP, so counting successes would throttle every user at once.
 * Each call builds its own in-memory store, which is per process; run one replica or swap in a shared store.
 */
const authLimiter = ({ max, windowMs, name }) =>
    rateLimit({
        windowMs,
        limit: max,
        skipSuccessfulRequests: true,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        handler: (req, res, _next, options) => {
            const retryAfter = Math.ceil(options.windowMs / 1000);
            req.log?.warn({ limiter: name }, 'Rate limit exceeded');
            res.status(429).json({
                error: 'Too Many Requests',
                message: `Too many failed attempts. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
                retryAfter,
            });
        },
    });

/** Limiters for POST /auth/google and POST /auth/refresh, read from the environment when the router is built. */
const createAuthLimiters = (env = process.env) => ({
    login: authLimiter({
        name: 'login',
        max: positiveInt(env.LOGIN_RATE_LIMIT_MAX, 10),
        windowMs: positiveInt(env.LOGIN_RATE_LIMIT_WINDOW_MS, FIFTEEN_MINUTES),
    }),
    refresh: authLimiter({
        name: 'refresh',
        max: positiveInt(env.REFRESH_RATE_LIMIT_MAX, 30),
        windowMs: positiveInt(env.REFRESH_RATE_LIMIT_WINDOW_MS, FIFTEEN_MINUTES),
    }),
});

module.exports = { createAuthLimiters, positiveInt };
