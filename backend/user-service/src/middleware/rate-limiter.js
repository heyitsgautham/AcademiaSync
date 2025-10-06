const rateLimit = require('express-rate-limit');

// ============================================================================
// RATE LIMITING FEATURE DISABLED - COMMENTED OUT
// ============================================================================
// The following rate limiting features have been disabled to allow unlimited
// login attempts without time-based restrictions.
// ============================================================================

// // In-memory store for tracking successful logins per user email
// // Format: { email: [timestamp1, timestamp2, ...] }
// const successfulLoginAttempts = new Map();

// // Custom middleware to track successful logins per user
// const trackSuccessfulLogin = (email) => {
//     const now = Date.now();
//     const windowMs = 10 * 60 * 1000; // 10 minutes - STRICT

//     // Get existing attempts for this email
//     let attempts = successfulLoginAttempts.get(email) || [];

//     // Filter out attempts older than the window
//     attempts = attempts.filter(timestamp => now - timestamp < windowMs);

//     // Add current attempt
//     attempts.push(now);

//     // Store updated attempts
//     successfulLoginAttempts.set(email, attempts);

//     return attempts.length;
// };

// // Check if user has exceeded successful login limit
// const checkSuccessfulLoginLimit = (email) => {
//     const now = Date.now();
//     const windowMs = 10 * 60 * 1000; // 10 minutes - STRICT
//     const maxAttempts = 5; // STRICT: 5 logins per 10 minutes

//     // Get existing attempts for this email
//     let attempts = successfulLoginAttempts.get(email) || [];

//     // Filter out attempts older than the window
//     attempts = attempts.filter(timestamp => now - timestamp < windowMs);

//     // Update the map with filtered attempts
//     successfulLoginAttempts.set(email, attempts);

//     return attempts.length >= maxAttempts;
// };

// // Cleanup old entries periodically (every 15 minutes)
// const cleanupInterval = setInterval(() => {
//     const now = Date.now();
//     const windowMs = 10 * 60 * 1000; // 10 minutes - STRICT

//     for (const [email, attempts] of successfulLoginAttempts.entries()) {
//         const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);

//         if (validAttempts.length === 0) {
//             successfulLoginAttempts.delete(email);
//         } else {
//             successfulLoginAttempts.set(email, validAttempts);
//         }
//     }
// }, 15 * 60 * 1000);

// // Function to cleanup the interval (useful for testing)
// const cleanupRateLimiter = () => {
//     if (cleanupInterval) {
//         clearInterval(cleanupInterval);
//     }
// };

// // Function to clear all rate limit entries (useful for development/debugging)
// const clearAllRateLimits = () => {
//     successfulLoginAttempts.clear();
//     console.log('✅ All rate limit entries cleared');
// };

// // Function to clear rate limit for specific email
// const clearRateLimitForEmail = (email) => {
//     if (successfulLoginAttempts.has(email)) {
//         successfulLoginAttempts.delete(email);
//         console.log(`✅ Rate limit cleared for email: ${email}`);
//         return true;
//     }
//     return false;
// };

// // Function to get current rate limit status for an email
// const getRateLimitStatus = (email) => {
//     const now = Date.now();
//     const windowMs = 10 * 60 * 1000; // 10 minutes - STRICT
//     const attempts = successfulLoginAttempts.get(email) || [];
//     const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);

//     return {
//         email,
//         attempts: validAttempts.length,
//         maxAttempts: 5, // STRICT
//         remaining: Math.max(0, 5 - validAttempts.length),
//         windowMs: windowMs
//     };
// };

// No-op replacements for disabled rate limiting functions
const trackSuccessfulLogin = (email) => {
    // Rate limiting disabled - no tracking
    return 0;
};

const checkSuccessfulLoginLimit = (email) => {
    // Rate limiting disabled - always return false (no limit exceeded)
    return false;
};

const cleanupRateLimiter = () => {
    // Rate limiting disabled - no cleanup needed
};

const clearAllRateLimits = () => {
    // Rate limiting disabled - nothing to clear
    console.log('✅ Rate limiting is disabled - no entries to clear');
};

const clearRateLimitForEmail = (email) => {
    // Rate limiting disabled - nothing to clear
    return false;
};

const getRateLimitStatus = (email) => {
    // Rate limiting disabled - return mock status
    return {
        email,
        attempts: 0,
        maxAttempts: 0,
        remaining: 0,
        windowMs: 0,
        disabled: true,
        message: 'Rate limiting is currently disabled'
    };
};

// IP-based rate limiter for login attempts - COMMENTED OUT FOR STRICT EMAIL-ONLY LIMITING
// Rate limiter for login attempts (IP-based as backup)
// 20 attempts per 15 minutes per IP address
// const loginLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 20, // 20 login requests per windowMs
//     message: {
//         error: 'Too Many Requests',
//         message: '🐼 Whoa there, eager beaver! You\'ve tried logging in too many times. Take a breather and try again in 15 minutes! ☕',
//         retryAfter: 900 // seconds (15 minutes)
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
//     handler: (req, res) => {
//         res.status(429).json({
//             error: 'Too Many Requests',
//             message: '🐼 Whoa there, eager beaver! You\'ve tried logging in too many times. Take a breather and try again in 15 minutes! ☕',
//             retryAfter: 900
//         });
//     },
//     skip: (req) => {
//         return process.env.NODE_ENV === 'test';
//     }
// });

// No-op middleware to replace loginLimiter when IP-based limiting is disabled
const loginLimiter = (req, res, next) => {
    next();
};

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
    checkSuccessfulLoginLimit,
    cleanupRateLimiter,
    clearAllRateLimits,
    clearRateLimitForEmail,
    getRateLimitStatus
};
