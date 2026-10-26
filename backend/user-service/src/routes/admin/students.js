const bcrypt = require('bcryptjs');
const { authenticate, authorize } = require('../../middleware/auth');
const { validateBody } = require('../../middleware/validate');
const { createStudentBody, updateStudentBody } = require('../../schemas');

const STUDENT_COLUMNS = `id, email, first_name AS "firstName", last_name AS "lastName", age, role`;

/** Postgres unique_violation, raised when an email is already taken */
const UNIQUE_VIOLATION = '23505';

/**
 * Student accounts: the list with enrollment and score totals, and create, update and delete.
 * Students normally appear on their first Google sign-in; an account created here is matched by email then.
 * @param {Router} router - Admin router
 * @param {Pool} pool - PostgreSQL connection pool
 */
module.exports = (router, pool) => {
    const admin = [authenticate, authorize('Admin')];

    /**
     * GET /admin/students
     * Get all students with enrollment count
     */
    router.get('/students', ...admin, async (req, res) => {
        try {
            const result = await pool.query(`
            SELECT 
                u.id,
                u.first_name as "firstName",
                u.last_name as "lastName",
                u.email,
                u.profile_picture,
                u.age,
                COUNT(DISTINCT e.id) as enrolled_courses,
                AVG(s.grade) as avg_score
            FROM users u
            LEFT JOIN enrollments e ON u.id = e.student_id
            LEFT JOIN submissions s ON u.id = s.student_id AND s.grade IS NOT NULL
            WHERE u.role = 'Student'
            GROUP BY u.id, u.first_name, u.last_name, u.email, u.profile_picture, u.age
            ORDER BY u.last_name, u.first_name
        `);

            const students = result.rows.map((row) => ({
                id: row.id,
                firstName: row.firstName,
                lastName: row.lastName,
                email: row.email,
                profilePicture: row.profile_picture,
                age: row.age,
                enrolledCourses: parseInt(row.enrolled_courses),
                avgScore: row.avg_score ? parseFloat(row.avg_score).toFixed(2) : null,
            }));

            res.json(students);
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching students');
            res.status(500).json({ error: 'Failed to fetch students' });
        }
    });

    /**
     * POST /admin/students
     * Create a student account
     */
    router.post('/students', ...admin, validateBody(createStudentBody), async (req, res) => {
        try {
            const { firstName, lastName, email, age, password } = req.body;
            const passwordHash = await bcrypt.hash(password, 10);

            const result = await pool.query(
                `INSERT INTO users (email, password_hash, role, first_name, last_name, age)
                 VALUES ($1, $2, 'Student', $3, $4, $5)
                 RETURNING ${STUDENT_COLUMNS}`,
                [email, passwordHash, firstName, lastName, age ?? null]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            if (error.code === UNIQUE_VIOLATION) {
                return res.status(409).json({ error: 'Email already exists' });
            }
            req.log.error({ err: error }, 'Error creating student');
            res.status(500).json({ error: 'Failed to create student' });
        }
    });

    /**
     * PUT /admin/students/:id
     * Update a student's name, email and age
     */
    router.put('/students/:id', ...admin, validateBody(updateStudentBody), async (req, res) => {
        try {
            const { firstName, lastName, email, age } = req.body;

            const result = await pool.query(
                `UPDATE users
                 SET first_name = $1, last_name = $2, email = $3, age = $4, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $5 AND role = 'Student'
                 RETURNING ${STUDENT_COLUMNS}`,
                [firstName, lastName, email, age ?? null, req.params.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Student not found' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            if (error.code === UNIQUE_VIOLATION) {
                return res.status(409).json({ error: 'Email already exists' });
            }
            req.log.error({ err: error }, 'Error updating student');
            res.status(500).json({ error: 'Failed to update student' });
        }
    });

    /**
     * DELETE /admin/students/:id
     * Delete a student with their enrollments, submissions and refresh tokens
     */
    router.delete('/students/:id', ...admin, async (req, res) => {
        try {
            const result = await pool.query("DELETE FROM users WHERE id = $1 AND role = 'Student' RETURNING id", [
                req.params.id,
            ]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Student not found' });
            }
            res.json({ message: 'Student deleted successfully' });
        } catch (error) {
            req.log.error({ err: error }, 'Error deleting student');
            res.status(500).json({ error: 'Failed to delete student' });
        }
    });
};
