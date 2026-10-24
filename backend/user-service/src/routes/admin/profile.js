const { authenticate, authorize } = require('../../middleware/auth');
const { validateBody } = require('../../middleware/validate');
const { adminProfileBody } = require('../../schemas');

/**
 * The signed-in admin's own name.
 * @param {Router} router - Admin router
 * @param {Pool} pool - PostgreSQL connection pool
 */
module.exports = (router, pool) => {
    /**
     * GET /admin/profile
     * Get admin profile
     */
    router.get('/profile', authenticate, authorize('Admin'), async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT id, email, first_name, last_name, role
             FROM users
             WHERE id = $1`,
                [req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching profile');
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    });

    /**
     * PUT /admin/profile
     * Update admin profile
     */
    router.put('/profile', authenticate, authorize('Admin'), validateBody(adminProfileBody), async (req, res) => {
        try {
            const { first_name, last_name } = req.body;

            const result = await pool.query(
                `UPDATE users 
             SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING id, email, first_name, last_name, role`,
                [first_name, last_name, req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            req.log.error({ err: error }, 'Error updating profile');
            res.status(500).json({ error: 'Failed to update profile' });
        }
    });
};
