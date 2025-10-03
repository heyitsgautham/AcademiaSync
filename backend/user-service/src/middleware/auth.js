const { verifyAccessToken } = require('../utils/jwt');

/**
 * Middleware to verify JWT access token from cookies or Authorization header
 * Attaches user info to req.user if token is valid
 */
const authenticate = (req, res, next) => {
    try {
        // Support both cookies and Authorization header
        let token = null;
        if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        } else if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.substring(7);
        }

        if (!token) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Access token not found'
            });
        }

        // Verify token
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: error.message
        });
    }
};

/**
 * Middleware to check if user has required role(s)
 * @param {string|string[]} roles - Required role(s)
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated'
            });
        }

        // Normalize role comparison (case-insensitive)
        const userRole = req.user.role.toLowerCase();
        const allowedRoles = roles.map(role => role.toLowerCase());

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: `Access denied. Required role(s): ${roles.join(', ')}`
            });
        }

        next();
    };
};

module.exports = {
    authenticate,
    authorize
};
