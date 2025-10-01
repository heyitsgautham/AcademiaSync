const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-jwt-refresh-key';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate an access token for a user
 * @param {Object} user - User object with id, email, and role
 * @returns {string} JWT access token
 */
const generateAccessToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRY
    });
};

/**
 * Generate a refresh token for a user
 * @param {Object} user - User object with id, email, and role
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };

    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRY
    });
};

/**
 * Verify an access token
 * @param {string} token - JWT access token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired access token');
    }
};

/**
 * Verify a refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

/**
 * Calculate expiration date for refresh token
 * @returns {Date} Expiration date
 */
const getRefreshTokenExpiry = () => {
    const expiry = JWT_REFRESH_EXPIRY;
    const match = expiry.match(/^(\d+)([dhms])$/);

    if (!match) {
        // Default to 7 days if format is invalid
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers = {
        's': 1000,
        'm': 60 * 1000,
        'h': 60 * 60 * 1000,
        'd': 24 * 60 * 60 * 1000
    };

    return new Date(Date.now() + value * multipliers[unit]);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    getRefreshTokenExpiry
};
