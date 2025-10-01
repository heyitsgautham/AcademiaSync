const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /student/dashboard
 * Student dashboard endpoint (protected)
 */
router.get('/dashboard', authenticate, authorize('Student'), (req, res) => {
    return res.status(200).json({
        message: 'Login successful, redirect to Student Dashboard',
        role: 'student',
        user: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
        }
    });
});

module.exports = router;
