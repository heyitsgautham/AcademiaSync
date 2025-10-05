const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /teacher/dashboard:
 *   get:
 *     summary: Get teacher dashboard information
 *     tags: [Teachers]
 *     description: Retrieve dashboard information for authenticated teacher (protected route)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Teacher dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful, redirect to Teacher Dashboard
 *                 role:
 *                   type: string
 *                   example: teacher
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: teacher@example.com
 *                     role:
 *                       type: string
 *                       example: Teacher
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher role required
 *       500:
 *         description: Internal server error
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
