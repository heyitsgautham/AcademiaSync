/**
 * Request validation at the route boundary.
 * Handlers behind these middlewares can trust the shape and types of what they read.
 */

const MAX_INT = 2147483647;

const badRequest = (res, message) => res.status(400).json({ error: 'Bad Request', message });

/**
 * Validates req.body against a zod schema and replaces it with the parsed value,
 * so numeric strings arrive as numbers and unknown fields are dropped.
 */
const validateBody = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
        return badRequest(res, result.error.issues[0].message);
    }
    req.body = result.data;
    return next();
};

/**
 * Router param callback that rejects ids Postgres would not accept as an INTEGER.
 * Without it, /courses/abc reached the database and came back as a 500.
 */
const requireIdParam = (req, res, next, value, name) => {
    if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > MAX_INT) {
        return badRequest(res, `${name} must be a positive integer`);
    }
    return next();
};

/** Registers requireIdParam for every listed route parameter on the router. */
const validateIdParams = (router, names) => {
    names.forEach((name) => router.param(name, requireIdParam));
};

module.exports = { validateBody, validateIdParams, requireIdParam };
