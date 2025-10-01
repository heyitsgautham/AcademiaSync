const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /teacher/dashboard
 * Teacher dashboard endpoint (protected)
 */
router.get('/dashboard', authenticate, authorize('Teacher'), (req, res) => {
    return res.status(200).json({
        message: 'Login successful, redirect to Teacher Dashboard',
        role: 'teacher',
        user: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
        }
    });
});

module.exports = router;
