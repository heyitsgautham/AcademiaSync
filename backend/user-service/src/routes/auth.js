const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, getRefreshTokenExpiry } = require('../utils/jwt');
const { loginLimiter, trackSuccessfulLogin, checkSuccessfulLoginLimit } = require('../middleware/rate-limiter');

const router = express.Router();

// Get pool from the parent module
let pool;
const getPool = () => {
    if (!pool) {
        pool = require('../index').pool;
    }
    return pool;
};

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Authenticate with Google OAuth
 *     tags: [Authentication]
 *     description: Authenticate user using Google OAuth ID token. Creates new user if doesn't exist.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google OAuth ID token
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               description: Sets accessToken and refreshToken cookies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authentication successful
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Missing ID token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid Google token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too Many Requests - Rate limit exceeded (5 attempts per 10 minutes)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Too Many Requests
 *                 message:
 *                   type: string
 *                   example: 🐼 Whoa there, eager beaver! You've tried logging in too many times. Take a breather and try again in 10 minutes! ☕
 *                 retryAfter:
 *                   type: number
 *                   example: 600
 */
router.post('/google', loginLimiter, async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Google ID token is required'
            });
        }

        // Verify Google token
        let ticket;
        try {
            ticket = await googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });
        } catch (error) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid Google token'
            });
        }

        const payload = ticket.getPayload();
        const { sub: googleId, email, given_name, family_name, picture } = payload;

        // Check if user has exceeded successful login limit (5 logins in 10 minutes)
        if (checkSuccessfulLoginLimit(email)) {
            return res.status(429).json({
                error: 'Too Many Requests',
                message: '🐼 Whoa there, eager beaver! You\'ve logged in and out too many times. Take a breather and try again in 10 minutes! ☕',
                retryAfter: 600
            });
        }

        // Check if user exists
        const dbPool = getPool();
        let userResult = await dbPool.query(
            'SELECT * FROM users WHERE google_id = $1 OR email = $2',
            [googleId, email]
        );

        let user;
        if (userResult.rows.length === 0) {
            // Create new user with Student role by default
            const insertResult = await dbPool.query(
                `INSERT INTO users (email, google_id, first_name, last_name, profile_picture, role) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
                [email, googleId, given_name || 'User', family_name || '', picture || null, 'Student']
            );
            user = insertResult.rows[0];
        } else {
            user = userResult.rows[0];

            // Update google_id and profile_picture if not set or if picture changed
            if (!user.google_id || user.profile_picture !== picture) {
                await dbPool.query(
                    'UPDATE users SET google_id = $1, profile_picture = $2 WHERE id = $3',
                    [googleId, picture || null, user.id]
                );
                user.google_id = googleId;
                user.profile_picture = picture;
            }
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Store refresh token in database
        const expiresAt = getRefreshTokenExpiry();
        await dbPool.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, refreshToken, expiresAt]
        );

        // Set tokens as httpOnly cookies
        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Track this successful login attempt for rate limiting
        trackSuccessfulLogin(email);

        return res.status(200).json({
            message: 'Login successful',
            role: user.role,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                profilePicture: user.profile_picture,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to authenticate with Google'
        });
    }
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     description: Get a new access token using the refresh token cookie
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully refreshed token
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               description: Sets new accessToken cookie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully
 *       401:
 *         description: Unauthorized - Invalid or missing refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Refresh token not found'
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (error) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired refresh token'
            });
        }

        // Check if refresh token exists in database
        const dbPool = getPool();
        const tokenResult = await dbPool.query(
            'SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2',
            [refreshToken, decoded.id]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Refresh token not found in database'
            });
        }

        const tokenRecord = tokenResult.rows[0];

        // Check if token is expired
        if (new Date(tokenRecord.expires_at) < new Date()) {
            // Delete expired token
            await dbPool.query('DELETE FROM refresh_tokens WHERE id = $1', [tokenRecord.id]);
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Refresh token has expired'
            });
        }

        // Get user data
        const userResult = await dbPool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        const user = userResult.rows[0];

        // Generate new access token
        const accessToken = generateAccessToken(user);

        // Set new access token as httpOnly cookie
        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        return res.status(200).json({
            message: 'Access token refreshed successfully'
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to refresh token'
        });
    }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     description: Logout user and invalidate refresh token. Clears authentication cookies.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            // Delete refresh token from database
            const dbPool = getPool();
            await dbPool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
        }

        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        return res.status(200).json({
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to logout'
        });
    }
});

module.exports = router;
