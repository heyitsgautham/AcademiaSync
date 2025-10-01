const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, getRefreshTokenExpiry } = require('../utils/jwt');

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
 * POST /auth/google
 * Authenticate user with Google OAuth
 * Body: { idToken: string }
 */
router.post('/google', async (req, res) => {
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
        const { sub: googleId, email, given_name, family_name } = payload;

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
                `INSERT INTO users (email, google_id, first_name, last_name, role) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
                [email, googleId, given_name || 'User', family_name || '', 'Student']
            );
            user = insertResult.rows[0];
        } else {
            user = userResult.rows[0];

            // Update google_id if not set
            if (!user.google_id) {
                await dbPool.query(
                    'UPDATE users SET google_id = $1 WHERE id = $2',
                    [googleId, user.id]
                );
                user.google_id = googleId;
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

        return res.status(200).json({
            message: 'Login successful',
            role: user.role,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
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
 * POST /auth/refresh
 * Refresh access token using refresh token
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
 * POST /auth/logout
 * Logout user and invalidate refresh token
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
