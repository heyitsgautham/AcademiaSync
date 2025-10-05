const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get pool from the parent module
let pool;
const getPool = () => {
    if (!pool) {
        pool = require('../index').pool;
    }
    return pool;
};

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get authenticated user's profile
 *     tags: [Users]
 *     description: Retrieve the profile information of the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   example: user@example.com
 *                 role:
 *                   type: string
 *                   enum: [Student, Teacher, Admin]
 *                   example: Student
 *                 first_name:
 *                   type: string
 *                   example: John
 *                 last_name:
 *                   type: string
 *                   example: Doe
 *                 age:
 *                   type: integer
 *                   example: 25
 *                 specialization:
 *                   type: string
 *                   example: Computer Science
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/profile', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await getPool().query(
            'SELECT id, email, role, first_name, last_name, age, specialization FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update authenticated user's profile
 *     tags: [Users]
 *     description: Update the profile information of the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               age:
 *                 type: integer
 *                 minimum: 18
 *                 maximum: 100
 *                 example: 25
 *               specialization:
 *                 type: string
 *                 example: Computer Science
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/profile', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { first_name, last_name, age, specialization } = req.body;

        // Validation
        if (!first_name) {
            return res.status(400).json({ message: 'First name is required' });
        }

        if (age !== null && age !== undefined && (age < 18 || age > 100)) {
            return res.status(400).json({ message: 'Age must be between 18 and 100' });
        }

        // Update user profile
        const result = await getPool().query(
            `UPDATE users 
       SET first_name = $1, last_name = $2, age = $3, specialization = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, email, role, first_name, last_name, age, specialization`,
            [first_name, last_name, age, specialization, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
});

module.exports = router;
