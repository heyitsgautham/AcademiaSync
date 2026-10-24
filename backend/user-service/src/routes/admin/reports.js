const { authenticate, authorize } = require('../../middleware/auth');
const { addAdminLinks, addTeacherLinks, addStudentLinks } = require('../../utils/hateoas');

/**
 * Platform-wide counts and rankings for the admin dashboard.
 * @param {Router} router - Admin router
 * @param {Pool} pool - PostgreSQL connection pool
 */
module.exports = (router, pool) => {
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
};
