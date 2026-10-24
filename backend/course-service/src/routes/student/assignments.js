const { parseSorting, buildStudentAssignmentsFilter } = require('../../utils/query-helpers');
const { validateBody } = require('../../middleware/validate');
const { submitAssignmentBody } = require('../../schemas');

/**
 * Assignment list, assignment detail and submission for the signed-in student.
 * @param {Router} router - Student router, already behind authenticate and authorize('Student')
 * @param {Pool} pool - PostgreSQL connection pool
 */
module.exports = (router, pool) => {
    /**
     * @swagger
     * /api/student/assignments:
     *   get:
     *     summary: Get all assignments for enrolled courses
     *     tags: [Student]
     *     description: Returns all assignments across all enrolled courses with submission status
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: List of assignments with student info
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
     *                 assignments:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Submission'
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Student role required
     *       500:
     *         description: Internal server error
     */
    router.get('/assignments', async (req, res) => {
        try {
            const studentId = req.user.id;

            // Parse query parameters - removed pagination since frontend handles it
            const { orderByClause } = parseSorting(req.query, ['due_date', 'title', 'course', 'status'], {
                due_date: 'a.due_date',
                title: 'a.title',
            });
            // $1 is the student id, so filter placeholders start at $2
            const { whereClause, values } = buildStudentAssignmentsFilter(req.query, 2);

            // Get student info
            const studentQuery = `
        SELECT CONCAT(first_name, ' ', last_name) as name, email
        FROM users
        WHERE id = $1
      `;
            const studentResult = await pool.query(studentQuery, [studentId]);

            // Get all assignments without pagination (frontend handles pagination)
            const assignmentsQuery = `
        SELECT
          a.id,
          a.title as name,
          c.id as course_id,
          c.title as course,
          TO_CHAR(a.due_date, 'YYYY-MM-DD') as "dueDate",
          a.description as question,
          CASE
            WHEN s.id IS NULL THEN 'Pending'
            WHEN s.grade IS NULL THEN 'Submitted'
            ELSE 'Graded'
          END as status,
          s.submission_text as submission,
          s.grade,
          s.feedback,
          TO_CHAR(s.submitted_at, 'YYYY-MM-DD') as "submittedAt"
        FROM assignments a
        INNER JOIN courses c ON a.course_id = c.id
        INNER JOIN enrollments e ON c.id = e.course_id AND e.student_id = $1
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = $1
        WHERE 1=1 ${whereClause}
        ORDER BY ${orderByClause}
      `;
            const assignmentsResult = await pool.query(assignmentsQuery, [studentId, ...values]);

            // Get enrolled courses list (for filtering dropdown)
            const coursesQuery = `
        SELECT c.id, c.title
        FROM courses c
        INNER JOIN enrollments e ON c.id = e.course_id
        WHERE e.student_id = $1
        ORDER BY c.title
      `;
            const coursesResult = await pool.query(coursesQuery, [studentId]);

            res.json({
                student: studentResult.rows[0],
                assignments: assignmentsResult.rows,
                courses: coursesResult.rows,
            });
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching assignments');
            res.status(500).json({
                error: 'Failed to fetch assignments',
            });
        }
    });

    /**
     * @swagger
     * /api/student/assignments/{assignmentId}:
     *   get:
     *     summary: Get single assignment details
     *     tags: [Student]
     *     description: Returns details of a specific assignment with submission status
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: assignmentId
     *         required: true
     *         schema:
     *           type: integer
     *         description: The assignment ID
     *     responses:
     *       200:
     *         description: Assignment details
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Student not enrolled in course
     *       404:
     *         description: Assignment not found
     *       500:
     *         description: Internal server error
     */
    router.get('/assignments/:assignmentId', async (req, res) => {
        try {
            const studentId = req.user.id;
            const { assignmentId } = req.params;

            // Get assignment details with submission
            const query = `
        SELECT 
          a.id,
          a.title as name,
          c.id as "courseId",
          c.title as course,
          TO_CHAR(a.due_date, 'YYYY-MM-DD HH24:MI') as "dueDate",
          a.description as question,
          CASE
            WHEN s.id IS NULL THEN 'Pending'
            WHEN s.grade IS NULL THEN 'Submitted'
            ELSE 'Graded'
          END as status,
          s.submission_text as submission,
          s.grade,
          s.feedback,
          TO_CHAR(s.submitted_at, 'YYYY-MM-DD HH24:MI') as "submittedAt"
        FROM assignments a
        INNER JOIN courses c ON a.course_id = c.id
        INNER JOIN enrollments e ON c.id = e.course_id AND e.student_id = $1
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = $1
        WHERE a.id = $2
      `;
            const result = await pool.query(query, [studentId, assignmentId]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: 'Assignment not found or you are not enrolled in this course',
                });
            }

            res.json(result.rows[0]);
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching assignment details');
            res.status(500).json({
                error: 'Failed to fetch assignment details',
            });
        }
    });

    /**
     * @swagger
     * /api/student/submit-assignment:
     *   post:
     *     summary: Submit or update an assignment
     *     tags: [Submissions]
     *     description: Submit or update an assignment submission for the authenticated student
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
     *               - assignmentId
     *               - submission
     *             properties:
     *               assignmentId:
     *                 type: integer
     *                 example: 1
     *               submission:
     *                 type: string
     *                 example: My assignment submission text
     *               fileName:
     *                 type: string
     *                 example: assignment.pdf
     *     responses:
     *       200:
     *         description: Assignment submitted successfully
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
     *         description: Bad request - Missing required fields
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Assignment not found or not enrolled in course
     *       500:
     *         description: Internal server error
     */
    router.post('/submit-assignment', validateBody(submitAssignmentBody), async (req, res) => {
        try {
            const studentId = req.user.id;
            const { assignmentId, submission } = req.body;

            // Check if assignment exists and student is enrolled in the course
            const checkQuery = `
        SELECT a.id
        FROM assignments a
        INNER JOIN courses c ON a.course_id = c.id
        INNER JOIN enrollments e ON c.id = e.course_id AND e.student_id = $1
        WHERE a.id = $2
      `;
            const checkResult = await pool.query(checkQuery, [studentId, assignmentId]);

            if (checkResult.rows.length === 0) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'Assignment not found or you are not enrolled in this course',
                });
            }

            // Insert or update submission
            const submissionQuery = `
        INSERT INTO submissions (assignment_id, student_id, submission_text, submitted_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (assignment_id, student_id)
        DO UPDATE SET
          submission_text = EXCLUDED.submission_text,
          submitted_at = CURRENT_TIMESTAMP
        RETURNING id
      `;
            await pool.query(submissionQuery, [assignmentId, studentId, submission]);

            res.json({
                success: true,
                message: 'Assignment submitted successfully',
            });
        } catch (error) {
            req.log.error({ err: error }, 'Error submitting assignment');
            res.status(500).json({
                error: 'Failed to submit assignment',
            });
        }
    });
};
