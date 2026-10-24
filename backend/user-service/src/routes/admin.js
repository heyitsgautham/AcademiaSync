const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticate, authorize } = require('../middleware/auth');
const { validateBody, validateIdParams } = require('../middleware/validate');
const { createTeacherBody, updateTeacherBody, promoteRoleBody, adminProfileBody } = require('../schemas');
const { addAdminLinks, addTeacherLinks, addStudentLinks } = require('../utils/hateoas');

module.exports = (pool) => {
    const router = express.Router();
    validateIdParams(router, ['id']);

    /**
     * @swagger
     * /admin/stats:
     *   get:
     *     summary: Get admin dashboard statistics
     *     tags: [Admin]
     *     description: Retrieve overall platform statistics including total teachers, students, courses, and average grade
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: Statistics retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 totalTeachers:
     *                   type: integer
     *                   example: 15
     *                 totalStudents:
     *                   type: integer
     *                   example: 250
     *                 totalCourses:
     *                   type: integer
     *                   example: 42
     *                 averageGrade:
     *                   type: number
     *                   format: float
     *                   example: 85.5
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Admin role required
     *       500:
     *         description: Internal server error
     */
    router.get('/stats', authenticate, authorize('Admin'), async (req, res) => {
        try {
            // Get total teachers
            const teachersResult = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'Teacher'");
            const totalTeachers = parseInt(teachersResult.rows[0].count);

            // Get total students
            const studentsResult = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'Student'");
            const totalStudents = parseInt(studentsResult.rows[0].count);

            // Get total courses
            const coursesResult = await pool.query('SELECT COUNT(*) as count FROM courses');
            const totalCourses = parseInt(coursesResult.rows[0].count);

            // Get average grade across all submissions
            const gradeResult = await pool.query(
                'SELECT AVG(grade) as avg_grade FROM submissions WHERE grade IS NOT NULL'
            );
            const averageGrade = gradeResult.rows[0].avg_grade
                ? parseFloat(gradeResult.rows[0].avg_grade).toFixed(2)
                : 0;

            res.json({
                totalTeachers,
                totalStudents,
                totalCourses,
                averageGrade: parseFloat(averageGrade),
                _links: addAdminLinks(),
            });
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching admin stats');
            res.status(500).json({ error: 'Failed to fetch statistics' });
        }
    });

    /**
     * @swagger
     * /admin/analytics:
     *   get:
     *     summary: Get analytics data
     *     tags: [Admin]
     *     description: Get detailed analytics including students per teacher and student age distribution. Requires API key for additional security.
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     parameters:
     *       - in: query
     *         name: apiKey
     *         required: true
     *         schema:
     *           type: string
     *         description: API key for accessing analytics data
     *         example: academiasync-analytics-key-2025-secure
     *     responses:
     *       200:
     *         description: Analytics data retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 studentsPerTeacher:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       teacher_name:
     *                         type: string
     *                       student_count:
     *                         type: integer
     *                 studentsByAge:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       age_group:
     *                         type: string
     *                       count:
     *                         type: integer
     *       401:
     *         description: Unauthorized - API key required or invalid
     *       403:
     *         description: Forbidden - Admin role required or invalid API key
     *       500:
     *         description: Internal server error
     */
    router.get('/analytics', authenticate, authorize('Admin'), async (req, res) => {
        try {
            // Get students per teacher
            const studentsPerTeacherResult = await pool.query(`
            SELECT 
                CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
                COUNT(DISTINCT e.student_id) as student_count
            FROM users u
            LEFT JOIN courses c ON u.id = c.teacher_id
            LEFT JOIN enrollments e ON c.id = e.course_id
            WHERE u.role = 'Teacher'
            GROUP BY u.id, u.first_name, u.last_name
            ORDER BY student_count DESC
        `);

            const studentsPerTeacher = studentsPerTeacherResult.rows.map((row) => ({
                teacherName: row.teacher_name,
                studentCount: parseInt(row.student_count),
            }));

            // Get top 5 performing students by average grade
            const topStudentsResult = await pool.query(`
            SELECT 
                u.id,
                CONCAT(u.first_name, ' ', u.last_name) as student_name,
                u.profile_picture,
                AVG(s.grade) as avg_grade,
                COUNT(s.id) as submission_count
            FROM users u
            INNER JOIN submissions s ON u.id = s.student_id
            WHERE u.role = 'Student' AND s.grade IS NOT NULL
            GROUP BY u.id, u.first_name, u.last_name, u.profile_picture
            HAVING COUNT(s.id) > 0
            ORDER BY avg_grade DESC
            LIMIT 5
        `);

            const topStudents = topStudentsResult.rows.map((row) => ({
                id: row.id,
                studentName: row.student_name,
                profilePicture: row.profile_picture,
                avgGrade: parseFloat(row.avg_grade).toFixed(2),
                submissionCount: parseInt(row.submission_count),
            }));

            // Get top 5 performing teachers by average student grades
            const topTeachersResult = await pool.query(`
            SELECT 
                u.id,
                CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
                u.profile_picture,
                AVG(s.grade) as avg_grade,
                COUNT(DISTINCT s.student_id) as student_count
            FROM users u
            INNER JOIN courses c ON u.id = c.teacher_id
            INNER JOIN assignments a ON c.id = a.course_id
            INNER JOIN submissions s ON a.id = s.assignment_id
            WHERE u.role = 'Teacher' AND s.grade IS NOT NULL
            GROUP BY u.id, u.first_name, u.last_name, u.profile_picture
            HAVING COUNT(s.id) > 0
            ORDER BY avg_grade DESC
            LIMIT 5
        `);

            const topTeachers = topTeachersResult.rows.map((row) => ({
                id: row.id,
                teacherName: row.teacher_name,
                profilePicture: row.profile_picture,
                avgGrade: parseFloat(row.avg_grade).toFixed(2),
                studentCount: parseInt(row.student_count),
            }));

            // Get top 5 performing courses by average grade
            const topCoursesResult = await pool.query(`
            SELECT 
                c.title as course_name,
                AVG(s.grade) as avg_grade,
                COUNT(DISTINCT e.student_id) as enrolled_count,
                COUNT(s.id) as submission_count
            FROM courses c
            LEFT JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN assignments a ON c.id = a.course_id
            LEFT JOIN submissions s ON a.id = s.assignment_id
            WHERE s.grade IS NOT NULL
            GROUP BY c.id, c.title
            HAVING COUNT(s.id) > 0
            ORDER BY avg_grade DESC
            LIMIT 5
        `);

            const topCourses = topCoursesResult.rows.map((row) => ({
                courseName: row.course_name,
                avgGrade: parseFloat(row.avg_grade).toFixed(2),
                enrolledCount: parseInt(row.enrolled_count),
                submissionCount: parseInt(row.submission_count),
            }));

            res.json({
                studentsPerTeacher,
                topStudents: topStudents.map((student) => addStudentLinks(student, 'Admin')),
                topTeachers: topTeachers.map((teacher) => addTeacherLinks(teacher, 'Admin')),
                topCourses,
                _links: addAdminLinks(),
            });
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching analytics');
            res.status(500).json({ error: 'Failed to fetch analytics' });
        }
    });

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
     * GET /admin/students
     * Get all students with enrollment count
     */
    router.get('/students', authenticate, authorize('Admin'), async (req, res) => {
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
     * POST /admin/promote-role
     * Promote a user to Teacher or Admin role
     */
    router.post('/promote-role', authenticate, authorize('Admin'), validateBody(promoteRoleBody), async (req, res) => {
        try {
            const { userId, newRole, specialization } = req.body;

            // Check if user exists
            const existingUser = await pool.query('SELECT id, role FROM users WHERE id = $1', [userId]);

            if (existingUser.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Update user role
            let updateQuery;
            let updateParams;

            if (newRole === 'Teacher') {
                updateQuery = `
                UPDATE users 
                SET role = $1, specialization = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $3
                RETURNING id, email, first_name as "firstName", last_name as "lastName", role, specialization
            `;
                updateParams = [newRole, specialization, userId];
            } else {
                updateQuery = `
                UPDATE users 
                SET role = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id, email, first_name as "firstName", last_name as "lastName", role
            `;
                updateParams = [newRole, userId];
            }

            const result = await pool.query(updateQuery, updateParams);

            res.json({
                message: `User promoted to ${newRole} successfully`,
                user: result.rows[0],
            });
        } catch (error) {
            req.log.error({ err: error }, 'Error promoting user');
            res.status(500).json({ error: 'Failed to promote user' });
        }
    });

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

    /**
     * @swagger
     * /admin/dashboard-analytics:
     *   get:
     *     summary: Get admin dashboard analytics
     *     tags: [Admin]
     *     description: Retrieve analytics for admin dashboard including user role distribution and enrollment trends
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: Dashboard analytics retrieved successfully
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Admin role required
     *       500:
     *         description: Internal server error
     */
    router.get('/dashboard-analytics', authenticate, authorize('Admin'), async (req, res) => {
        try {
            // Get user role distribution
            const roleDistribution = await pool.query(`
            SELECT 
                role as name,
                COUNT(*)::integer as value
            FROM users
            WHERE role IN ('Student', 'Teacher', 'Admin')
            GROUP BY role
            ORDER BY 
                CASE role
                    WHEN 'Student' THEN 1
                    WHEN 'Teacher' THEN 2
                    WHEN 'Admin' THEN 3
                END
        `);

            // Get enrollment trend for last 7 days
            const enrollmentTrend = await pool.query(`
            SELECT 
                TO_CHAR(enrolled_at, 'Mon DD') as period,
                COUNT(*)::integer as enrollments
            FROM enrollments
            WHERE enrolled_at >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY TO_CHAR(enrolled_at, 'Mon DD'), DATE(enrolled_at)
            ORDER BY DATE(enrolled_at)
        `);

            res.json({
                userRoleDistribution: roleDistribution.rows,
                enrollmentTrend: enrollmentTrend.rows,
                _links: addAdminLinks(),
            });
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching admin dashboard analytics');
            res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
        }
    });

    return router;
};
