const { addCourseLinks, addStudentDashboardLinks } = require('../../utils/hateoas');
const { validateBody } = require('../../middleware/validate');
const { enrollBody } = require('../../schemas');

/**
 * Course discovery, enrollment and the enrolled-course list for the signed-in student.
 * @param {Router} router - Student router, already behind authenticate and authorize('Student')
 * @param {Pool} pool - PostgreSQL connection pool
 */
module.exports = (router, pool) => {
    /**
     * @swagger
     * /api/student/available-courses:
     *   get:
     *     summary: Get available courses for enrollment
     *     tags: [Student]
     *     description: Returns all courses that the authenticated student is NOT enrolled in
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: List of available courses
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: integer
     *                   title:
     *                     type: string
     *                   description:
     *                     type: string
     *                   instructor:
     *                     type: string
     *                   duration:
     *                     type: string
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Student role required
     *       500:
     *         description: Internal server error
     */
    router.get('/available-courses', async (req, res) => {
        try {
            const studentId = req.user.id;

            const query = `
        SELECT 
          c.id,
          c.title,
          c.description,
          CONCAT(u.first_name, ' ', u.last_name) as instructor,
          CONCAT(c.weeks, ' weeks') as duration
        FROM courses c
        INNER JOIN users u ON c.teacher_id = u.id
        WHERE c.id NOT IN (
          SELECT course_id 
          FROM enrollments 
          WHERE student_id = $1
        )
        ORDER BY c.created_at DESC
      `;

            const result = await pool.query(query, [studentId]);
            const coursesWithLinks = result.rows.map((course) => addCourseLinks(course, 'Student', false));

            res.json({
                courses: coursesWithLinks,
                _links: addStudentDashboardLinks(),
            });
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching available courses');
            res.status(500).json({
                error: 'Failed to fetch available courses',
            });
        }
    });

    /**
     * @swagger
     * /api/student/enroll:
     *   post:
     *     summary: Enroll in a course
     *     tags: [Enrollments]
     *     description: Enrolls the authenticated student in a specified course
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
     *               - courseId
     *             properties:
     *               courseId:
     *                 type: integer
     *                 example: 1
     *     responses:
     *       200:
     *         description: Successfully enrolled
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *       400:
     *         description: Bad request - Missing courseId or course not found
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Student role required
     *       409:
     *         description: Conflict - Already enrolled in this course
     *       500:
     *         description: Internal server error
     */
    router.post('/enroll', validateBody(enrollBody), async (req, res) => {
        try {
            const studentId = req.user.id;
            const { courseId } = req.body;

            // Check if course exists
            const courseCheck = await pool.query('SELECT id FROM courses WHERE id = $1', [courseId]);

            if (courseCheck.rows.length === 0) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Course not found',
                });
            }

            // Check if already enrolled
            const enrollmentCheck = await pool.query(
                'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
                [studentId, courseId]
            );

            if (enrollmentCheck.rows.length > 0) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Already enrolled in this course',
                });
            }

            // Create enrollment
            await pool.query('INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)', [studentId, courseId]);

            res.json({
                success: true,
                message: 'Successfully enrolled in course',
            });
        } catch (error) {
            req.log.error({ err: error }, 'Error enrolling in course');
            res.status(500).json({
                error: 'Failed to enroll in course',
            });
        }
    });

    /**
     * @swagger
     * /api/student/courses:
     *   get:
     *     summary: Get enrolled courses
     *     tags: [Student]
     *     description: Returns all courses that the authenticated student IS enrolled in with progress
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: List of enrolled courses with student info
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 student:
     *                   type: object
     *                   properties:
     *                     name:
     *                       type: string
     *                     email:
     *                       type: string
     *                 courses:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: integer
     *                       title:
     *                         type: string
     *                       instructor:
     *                         type: string
     *                       progress:
     *                         type: number
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Student role required
     *       500:
     *         description: Internal server error
     */
    router.get('/courses', async (req, res) => {
        try {
            const studentId = req.user.id;

            // Get student info
            const studentQuery = `
        SELECT CONCAT(first_name, ' ', last_name) as name, email
        FROM users
        WHERE id = $1
      `;
            const studentResult = await pool.query(studentQuery, [studentId]);

            // Get enrolled courses with progress
            const coursesQuery = `
        SELECT 
          c.id,
          c.title,
          c.description,
          CONCAT(u.first_name, ' ', u.last_name) as instructor,
          u.profile_picture as "instructorPicture",
          CASE 
            WHEN COUNT(a.id) = 0 THEN 0
            ELSE ROUND((COUNT(s.id)::numeric / COUNT(a.id)::numeric) * 100)
          END as progress
        FROM courses c
        INNER JOIN enrollments e ON c.id = e.course_id
        INNER JOIN users u ON c.teacher_id = u.id
        LEFT JOIN assignments a ON c.id = a.course_id
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = $1
        WHERE e.student_id = $1
        GROUP BY c.id, c.title, c.description, u.first_name, u.last_name, u.profile_picture
        ORDER BY c.created_at DESC
      `;
            const coursesResult = await pool.query(coursesQuery, [studentId]);

            res.json({
                student: studentResult.rows[0],
                courses: coursesResult.rows,
            });
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching enrolled courses');
            res.status(500).json({
                error: 'Failed to fetch enrolled courses',
            });
        }
    });
};
