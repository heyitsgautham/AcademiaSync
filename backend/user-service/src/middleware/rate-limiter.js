const rateLimit = require('express-rate-limit');

// In-memory store for tracking successful logins per user email
// Format: { email: [timestamp1, timestamp2, ...] }
const successfulLoginAttempts = new Map();

// Custom middleware to track successful logins per user
const trackSuccessfulLogin = (email) => {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000; // 10 minutes

    // Get existing attempts for this email
    let attempts = successfulLoginAttempts.get(email) || [];

    // Filter out attempts older than the window
    attempts = attempts.filter(timestamp => now - timestamp < windowMs);

    // Add current attempt
    attempts.push(now);

    // Store updated attempts
    successfulLoginAttempts.set(email, attempts);

    return attempts.length;
};

// Check if user has exceeded successful login limit
const checkSuccessfulLoginLimit = (email) => {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000; // 10 minutes
    const maxAttempts = 5;

    // Get existing attempts for this email
    let attempts = successfulLoginAttempts.get(email) || [];

    // Filter out attempts older than the window
    attempts = attempts.filter(timestamp => now - timestamp < windowMs);

    // Update the map with filtered attempts
    successfulLoginAttempts.set(email, attempts);

    return attempts.length >= maxAttempts;
};

// Cleanup old entries periodically (every 15 minutes)
setInterval(() => {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;

    for (const [email, attempts] of successfulLoginAttempts.entries()) {
        const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);

        if (validAttempts.length === 0) {
            successfulLoginAttempts.delete(email);
        } else {
            successfulLoginAttempts.set(email, validAttempts);
        }
    }
}, 15 * 60 * 1000);

// Rate limiter for login attempts (IP-based as backup)
// 5 attempts per 10 minutes per IP address
const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: {
        error: 'Too Many Requests',
        message: '🐼 Whoa there, eager beaver! You\'ve tried logging in too many times. Take a breather and try again in 10 minutes! ☕',
        retryAfter: 600 // seconds
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too Many Requests',
            message: '🐼 Whoa there, eager beaver! You\'ve tried logging in too many times. Take a breather and try again in 10 minutes! ☕',
            retryAfter: 600
        });
    },
    // Skip rate limiting for certain IPs (optional, useful for testing)
    skip: (req) => {
        // Skip rate limiting in test environment
        return process.env.NODE_ENV === 'test';
    }
});

// General API rate limiter (100 requests per 15 minutes)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too Many Requests',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    loginLimiter,
    apiLimiter,
    trackSuccessfulLogin,
    checkSuccessfulLoginLimit
};
