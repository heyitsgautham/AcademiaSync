const bcrypt = require('bcryptjs');
const { authenticate, authorize } = require('../../middleware/auth');
const { validateBody } = require('../../middleware/validate');
const { createTeacherBody, updateTeacherBody, promoteRoleBody, changeRoleBody } = require('../../schemas');
const { changeUserRole } = require('./roles');
const { addAdminLinks, addTeacherLinks } = require('../../utils/hateoas');

/**
 * Teacher accounts and role changes.
 * @param {Router} router - Admin router
 * @param {Pool} pool - PostgreSQL connection pool
 */
module.exports = (router, pool) => {
    /**
     * GET /admin/teachers
     * Get all teachers with their stats
     */
    router.get('/teachers', authenticate, authorize('Admin'), async (req, res) => {
        try {
            const result = await pool.query(`
            SELECT 
                u.id,
                u.first_name as "firstName",
                u.last_name as "lastName",
                u.email,
                u.profile_picture,
                u.specialization,
                COUNT(DISTINCT c.id) as course_count,
                COUNT(DISTINCT e.student_id) as student_count
            FROM users u
            LEFT JOIN courses c ON u.id = c.teacher_id
            LEFT JOIN enrollments e ON c.id = e.course_id
            WHERE u.role = 'Teacher'
            GROUP BY u.id, u.first_name, u.last_name, u.email, u.profile_picture, u.specialization
            ORDER BY u.last_name, u.first_name
        `);

            const teachers = result.rows.map((row) => {
                const teacher = {
                    id: row.id,
                    firstName: row.firstName,
                    lastName: row.lastName,
                    email: row.email,
                    profilePicture: row.profile_picture,
                    specialization: row.specialization || '',
                    courseCount: parseInt(row.course_count),
                    studentCount: parseInt(row.student_count),
                };
                return addTeacherLinks(teacher, 'Admin');
            });

            res.json({
                teachers,
                _links: addAdminLinks(),
            });
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching teachers');
            res.status(500).json({ error: 'Failed to fetch teachers' });
        }
    });

    /**
     * POST /admin/teachers
     * Create a new teacher
     */
    router.post('/teachers', authenticate, authorize('Admin'), validateBody(createTeacherBody), async (req, res) => {
        try {
            const { firstName, lastName, email, specialization, password } = req.body;

            // Check if email already exists
            const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

            if (existingUser.rows.length > 0) {
                return res.status(409).json({ error: 'Email already exists' });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Insert new teacher
            const result = await pool.query(
                `INSERT INTO users (email, password_hash, role, first_name, last_name, specialization)
             VALUES ($1, $2, 'Teacher', $3, $4, $5)
             RETURNING id, email, first_name as "firstName", last_name as "lastName", role, specialization`,
                [email, passwordHash, firstName, lastName, specialization]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            req.log.error({ err: error }, 'Error creating teacher');
            res.status(500).json({ error: 'Failed to create teacher' });
        }
    });

    /**
     * PUT /admin/teachers/:id
     * Update a teacher
     */
    router.put('/teachers/:id', authenticate, authorize('Admin'), validateBody(updateTeacherBody), async (req, res) => {
        try {
            const { id } = req.params;
            const { firstName, lastName, specialization } = req.body;

            // Check if teacher exists
            const existingTeacher = await pool.query("SELECT id FROM users WHERE id = $1 AND role = 'Teacher'", [id]);

            if (existingTeacher.rows.length === 0) {
                return res.status(404).json({ error: 'Teacher not found' });
            }

            // Update teacher
            const result = await pool.query(
                `UPDATE users 
             SET first_name = $1, last_name = $2, specialization = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4
             RETURNING id, email, first_name as "firstName", last_name as "lastName", specialization`,
                [firstName, lastName, specialization, id]
            );

            res.json(result.rows[0]);
        } catch (error) {
            req.log.error({ err: error }, 'Error updating teacher');
            res.status(500).json({ error: 'Failed to update teacher' });
        }
    });

    /**
     * DELETE /admin/teachers/:id
     * Delete a teacher (cascades to courses, assignments, etc.)
     */
    router.delete('/teachers/:id', authenticate, authorize('Admin'), async (req, res) => {
        try {
            const { id } = req.params;

            // Check if teacher exists
            const existingTeacher = await pool.query("SELECT id FROM users WHERE id = $1 AND role = 'Teacher'", [id]);

            if (existingTeacher.rows.length === 0) {
                return res.status(404).json({ error: 'Teacher not found' });
            }

            // Delete teacher (cascade will handle related records)
            await pool.query('DELETE FROM users WHERE id = $1', [id]);

            res.json({ message: 'Teacher deleted successfully' });
        } catch (error) {
            req.log.error({ err: error }, 'Error deleting teacher');
            res.status(500).json({ error: 'Failed to delete teacher' });
        }
    });

    /**
     * POST /admin/promote-role
     * Promote a user to Teacher or Admin role
     */
    router.post('/promote-role', authenticate, authorize('Admin'), validateBody(promoteRoleBody), async (req, res) => {
        try {
            const { userId, newRole, specialization } = req.body;

            const result = await changeUserRole(pool, { userId, newRole, specialization, actorId: req.user.id });
            if (result.error) return res.status(result.status).json({ error: result.error });

            res.json({
                message: `User promoted to ${newRole} successfully`,
                user: result.user,
            });
        } catch (error) {
            req.log.error({ err: error }, 'Error promoting user');
            res.status(500).json({ error: 'Failed to promote user' });
        }
    });

    /**
     * POST /admin/change-role
     * Move a user to any role, including back to Student
     */
    router.post('/change-role', authenticate, authorize('Admin'), validateBody(changeRoleBody), async (req, res) => {
        try {
            const { userId, newRole, specialization } = req.body;
            const result = await changeUserRole(pool, { userId, newRole, specialization, actorId: req.user.id });
            if (result.error) return res.status(result.status).json({ error: result.error });

            res.json({
                message: `Role changed to ${newRole} successfully`,
                user: result.user,
            });
        } catch (error) {
            req.log.error({ err: error }, 'Error changing role');
            res.status(500).json({ error: 'Failed to change role' });
        }
    });
};
