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
 * GET /api/users/profile
 * Get authenticated user's profile
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
 * PUT /api/users/profile
 * Update authenticated user's profile
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, age, specialization } = req.body;

    // Validation
    if (!first_name || !last_name) {
      return res.status(400).json({ message: 'First name and last name are required' });
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
