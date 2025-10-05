const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /student/dashboard:
 *   get:
 *     summary: Get student dashboard information
 *     tags: [Dashboard]
 *     description: Retrieve dashboard information for authenticated student (protected route)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Student dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful, redirect to Student Dashboard
 *                 role:
 *                   type: string
 *                   example: student
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: student@example.com
 *                     role:
 *                       type: string
 *                       example: Student
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Student role required
 *       500:
 *         description: Internal server error
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
