const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticate, authorize } = require('../middleware/auth');
const { addAdminLinks, addTeacherLinks, addStudentLinks } = require('../utils/hateoas');

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
        const db = getPool();

        // Get total teachers
        const teachersResult = await db.query(
            "SELECT COUNT(*) as count FROM users WHERE role = 'Teacher'"
        );
        const totalTeachers = parseInt(teachersResult.rows[0].count);

        // Get total students
        const studentsResult = await db.query(
            "SELECT COUNT(*) as count FROM users WHERE role = 'Student'"
        );
        const totalStudents = parseInt(studentsResult.rows[0].count);

        // Get total courses
        const coursesResult = await db.query(
            "SELECT COUNT(*) as count FROM courses"
        );
        const totalCourses = parseInt(coursesResult.rows[0].count);

        // Get average grade across all submissions
        const gradeResult = await db.query(
            "SELECT AVG(grade) as avg_grade FROM submissions WHERE grade IS NOT NULL"
        );
        const averageGrade = gradeResult.rows[0].avg_grade
            ? parseFloat(gradeResult.rows[0].avg_grade).toFixed(2)
            : 0;

        res.json({
            totalTeachers,
            totalStudents,
            totalCourses,
            averageGrade: parseFloat(averageGrade),
            _links: addAdminLinks()
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get analytics data
 *     tags: [Admin]
 *     description: Get detailed analytics including students per teacher and student age distribution
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
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
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       500:
 *         description: Internal server error
 */
router.get('/analytics', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const db = getPool();

        // Get students per teacher
        const studentsPerTeacherResult = await db.query(`
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

        const studentsPerTeacher = studentsPerTeacherResult.rows.map(row => ({
            teacherName: row.teacher_name,
            studentCount: parseInt(row.student_count)
        }));

        // Get top 5 performing students by average grade
        const topStudentsResult = await db.query(`
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

        const topStudents = topStudentsResult.rows.map(row => ({
            id: row.id,
            studentName: row.student_name,
            profilePicture: row.profile_picture,
            avgGrade: parseFloat(row.avg_grade).toFixed(2),
            submissionCount: parseInt(row.submission_count)
        }));

        // Get top 5 performing teachers by average student grades
        const topTeachersResult = await db.query(`
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

        const topTeachers = topTeachersResult.rows.map(row => ({
            id: row.id,
            teacherName: row.teacher_name,
            profilePicture: row.profile_picture,
            avgGrade: parseFloat(row.avg_grade).toFixed(2),
            studentCount: parseInt(row.student_count)
        }));

        // Get top 5 performing courses by average grade
        const topCoursesResult = await db.query(`
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

        const topCourses = topCoursesResult.rows.map(row => ({
            courseName: row.course_name,
            avgGrade: parseFloat(row.avg_grade).toFixed(2),
            enrolledCount: parseInt(row.enrolled_count),
            submissionCount: parseInt(row.submission_count)
        }));

        res.json({
            studentsPerTeacher,
            topStudents: topStudents.map(student => addStudentLinks(student, 'Admin')),
            topTeachers: topTeachers.map(teacher => addTeacherLinks(teacher, 'Admin')),
            topCourses,
            _links: addAdminLinks()
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

/**
 * GET /admin/teachers
 * Get all teachers with their stats
 */
router.get('/teachers', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const db = getPool();

        const result = await db.query(`
            SELECT 
                u.id,
                u.first_name as "firstName",
                u.last_name as "lastName",
                u.email,
                u.specialization,
                COUNT(DISTINCT c.id) as course_count,
                COUNT(DISTINCT e.student_id) as student_count
            FROM users u
            LEFT JOIN courses c ON u.id = c.teacher_id
            LEFT JOIN enrollments e ON c.id = e.course_id
            WHERE u.role = 'Teacher'
            GROUP BY u.id, u.first_name, u.last_name, u.email, u.specialization
            ORDER BY u.last_name, u.first_name
        `);

        const teachers = result.rows.map(row => {
            const teacher = {
                id: row.id,
                firstName: row.firstName,
                lastName: row.lastName,
                email: row.email,
                specialization: row.specialization || '',
                courseCount: parseInt(row.course_count),
                studentCount: parseInt(row.student_count)
            };
            return addTeacherLinks(teacher, 'Admin');
        });

        res.json({
            teachers,
            _links: addAdminLinks()
        });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ error: 'Failed to fetch teachers' });
    }
});

/**
 * POST /admin/teachers
 * Create a new teacher
 */
router.post('/teachers', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const { firstName, lastName, email, specialization, password } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !specialization || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const db = getPool();

        // Check if email already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert new teacher
        const result = await db.query(
            `INSERT INTO users (email, password_hash, role, first_name, last_name, specialization)
             VALUES ($1, $2, 'Teacher', $3, $4, $5)
             RETURNING id, email, first_name as "firstName", last_name as "lastName", role, specialization`,
            [email, passwordHash, firstName, lastName, specialization]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating teacher:', error);
        res.status(500).json({ error: 'Failed to create teacher' });
    }
});

/**
 * PUT /admin/teachers/:id
 * Update a teacher
 */
router.put('/teachers/:id', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, specialization } = req.body;

        // Validation
        if (!firstName || !lastName || !specialization) {
            return res.status(400).json({ error: 'First name, last name, and specialization are required' });
        }

        const db = getPool();

        // Check if teacher exists
        const existingTeacher = await db.query(
            "SELECT id FROM users WHERE id = $1 AND role = 'Teacher'",
            [id]
        );

        if (existingTeacher.rows.length === 0) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        // Update teacher
        const result = await db.query(
            `UPDATE users 
             SET first_name = $1, last_name = $2, specialization = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4
             RETURNING id, email, first_name as "firstName", last_name as "lastName", specialization`,
            [firstName, lastName, specialization, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating teacher:', error);
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
        const db = getPool();

        // Check if teacher exists
        const existingTeacher = await db.query(
            "SELECT id FROM users WHERE id = $1 AND role = 'Teacher'",
            [id]
        );

        if (existingTeacher.rows.length === 0) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        // Delete teacher (cascade will handle related records)
        await db.query('DELETE FROM users WHERE id = $1', [id]);

        res.json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({ error: 'Failed to delete teacher' });
    }
});

/**
 * GET /admin/students
 * Get all students with enrollment count
 */
router.get('/students', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const db = getPool();

        const result = await db.query(`
            SELECT 
                u.id,
                u.first_name as "firstName",
                u.last_name as "lastName",
                u.email,
                u.age,
                COUNT(e.id) as enrolled_courses
            FROM users u
            LEFT JOIN enrollments e ON u.id = e.student_id
            WHERE u.role = 'Student'
            GROUP BY u.id, u.first_name, u.last_name, u.email, u.age
            ORDER BY u.last_name, u.first_name
        `);

        const students = result.rows.map(row => ({
            id: row.id,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            age: row.age,
            enrolledCourses: parseInt(row.enrolled_courses)
        }));

        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

/**
 * POST /admin/promote-role
 * Promote a user to Teacher or Admin role
 */
router.post('/promote-role', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const { userId, newRole, specialization } = req.body;

        // Validation
        if (!userId || !newRole) {
            return res.status(400).json({ error: 'User ID and new role are required' });
        }

        if (!['Teacher', 'Admin'].includes(newRole)) {
            return res.status(400).json({ error: 'Invalid role. Must be Teacher or Admin' });
        }

        if (newRole === 'Teacher' && !specialization) {
            return res.status(400).json({ error: 'Specialization is required for Teacher role' });
        }

        const db = getPool();

        // Check if user exists
        const existingUser = await db.query(
            'SELECT id, role FROM users WHERE id = $1',
            [userId]
        );

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

        const result = await db.query(updateQuery, updateParams);

        res.json({
            message: `User promoted to ${newRole} successfully`,
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error promoting user:', error);
        res.status(500).json({ error: 'Failed to promote user' });
    }
});

/**
 * GET /admin/profile
 * Get admin profile
 */
router.get('/profile', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const db = getPool();

        const result = await db.query(
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
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

/**
 * PUT /admin/profile
 * Update admin profile
 */
router.put('/profile', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const { first_name, last_name } = req.body;

        // Validation
        if (!first_name) {
            return res.status(400).json({ error: 'First name is required' });
        }

        const db = getPool();

        const result = await db.query(
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
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
