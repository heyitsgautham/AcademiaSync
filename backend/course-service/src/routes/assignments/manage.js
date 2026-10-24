const { authenticate, authorize } = require('../../middleware/auth');
const { addAssignmentLinks } = require('../../utils/hateoas');
const { validateBody } = require('../../middleware/validate');
const { assignmentBody } = require('../../schemas');

/**
 * Create, read, update and delete assignments on the teacher's own courses.
 * @param {Router} router - Teacher assignment router
 * @param {Pool} pool - PostgreSQL connection pool
 */
module.exports = (router, pool) => {
    /**
     * @swagger
     * /api/teacher/courses/{courseId}/assignments:
     *   get:
     *     summary: Get all assignments for a specific course
     *     tags: [Assignments]
     *     description: Retrieve all assignments for a course with submission counts (teacher can only access their own courses)
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: courseId
     *         required: true
     *         schema:
     *           type: integer
     *         description: Course ID
     *     responses:
     *       200:
     *         description: List of assignments
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Assignment'
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Teacher role required
     *       404:
     *         description: Course not found or access denied
     *       500:
     *         description: Internal server error
     */
    router.get('/courses/:courseId/assignments', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { courseId } = req.params;
            const teacherId = req.user.id;

            // Verify the course belongs to the teacher
            const courseCheck = await pool.query('SELECT id FROM courses WHERE id = $1 AND teacher_id = $2', [
                courseId,
                teacherId,
            ]);

            if (courseCheck.rows.length === 0) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Course not found or access denied',
                });
            }

            const result = await pool.query(
                `SELECT a.id, a.course_id, a.title, a.description, a.due_date, a.created_at, a.updated_at,
                        COUNT(s.id) as submission_count
                 FROM assignments a
                 LEFT JOIN submissions s ON a.id = s.assignment_id
                 WHERE a.course_id = $1
                 GROUP BY a.id
                 ORDER BY a.due_date ASC`,
                [courseId]
            );

            const assignmentsWithLinks = result.rows.map((assignment) =>
                addAssignmentLinks(assignment, req.user.role, true)
            );

            const baseUrl = process.env.API_BASE_URL || 'http://localhost:5001';
            res.json({
                assignments: assignmentsWithLinks,
                _links: [
                    {
                        rel: 'course',
                        href: `${baseUrl}/teacher/courses/${courseId}`,
                        method: 'GET',
                        description: 'Get parent course',
                    },
                ],
            });
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching assignments');
            res.status(500).json({
                error: 'Internal server error',
            });
        }
    });

    /**
     * @swagger
     * /api/teacher/courses/{courseId}/assignments:
     *   post:
     *     summary: Create a new assignment for a course
     *     tags: [Assignments]
     *     description: Create a new assignment for a specific course (teacher must own the course)
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: courseId
     *         required: true
     *         schema:
     *           type: integer
     *         description: Course ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - title
     *               - description
     *             properties:
     *               title:
     *                 type: string
     *                 description: Assignment title
     *                 example: React Hooks Implementation
     *               description:
     *                 type: string
     *                 description: Assignment description
     *                 example: Implement a custom React hook for data fetching
     *               due_date:
     *                 type: string
     *                 format: date-time
     *                 description: Assignment due date
     *                 example: 2025-10-15T23:59:59Z
     *     responses:
     *       201:
     *         description: Assignment created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Assignment'
     *       400:
     *         description: Bad request - Missing required fields
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Teacher role required
     *       404:
     *         description: Course not found or access denied
     *       500:
     *         description: Internal server error
     */
    router.post(
        '/courses/:courseId/assignments',
        authenticate,
        authorize('teacher'),
        validateBody(assignmentBody),
        async (req, res) => {
            try {
                const { courseId } = req.params;
                const { title, description, due_date } = req.body;
                const teacherId = req.user.id;

                // Verify the course belongs to the teacher
                const courseCheck = await pool.query('SELECT id FROM courses WHERE id = $1 AND teacher_id = $2', [
                    courseId,
                    teacherId,
                ]);

                if (courseCheck.rows.length === 0) {
                    return res.status(404).json({
                        error: 'Not found',
                        message: 'Course not found or access denied',
                    });
                }

                const result = await pool.query(
                    `INSERT INTO assignments (course_id, title, description, due_date)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                    [courseId, title, description, due_date || null]
                );

                res.status(201).json(result.rows[0]);
            } catch (error) {
                req.log.error({ err: error }, 'Error creating assignment');
                res.status(500).json({
                    error: 'Internal server error',
                });
            }
        }
    );

    // Get a single assignment by ID
    router.get('/assignments/:id', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { id } = req.params;
            const teacherId = req.user.id;

            const result = await pool.query(
                `SELECT a.*, c.teacher_id
                 FROM assignments a
                 JOIN courses c ON a.course_id = c.id
                 WHERE a.id = $1 AND c.teacher_id = $2`,
                [id, teacherId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Assignment not found or access denied',
                });
            }

            res.json(result.rows[0]);
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching assignment');
            res.status(500).json({
                error: 'Internal server error',
            });
        }
    });

    // Update an assignment
    router.put(
        '/assignments/:id',
        authenticate,
        authorize('teacher'),
        validateBody(assignmentBody),
        async (req, res) => {
            try {
                const { id } = req.params;
                const { title, description, due_date } = req.body;
                const teacherId = req.user.id;

                // Check if assignment exists and belongs to teacher's course
                const checkResult = await pool.query(
                    `SELECT a.id FROM assignments a
                 JOIN courses c ON a.course_id = c.id
                 WHERE a.id = $1 AND c.teacher_id = $2`,
                    [id, teacherId]
                );

                if (checkResult.rows.length === 0) {
                    return res.status(404).json({
                        error: 'Not found',
                        message: 'Assignment not found or access denied',
                    });
                }

                const result = await pool.query(
                    `UPDATE assignments
                 SET title = $1, description = $2, due_date = $3, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $4
                 RETURNING *`,
                    [title, description, due_date || null, id]
                );

                res.json(result.rows[0]);
            } catch (error) {
                req.log.error({ err: error }, 'Error updating assignment');
                res.status(500).json({
                    error: 'Internal server error',
                });
            }
        }
    );

    // Delete an assignment
    router.delete('/assignments/:id', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { id } = req.params;
            const teacherId = req.user.id;

            // Check if assignment exists and belongs to teacher's course
            const checkResult = await pool.query(
                `SELECT a.id FROM assignments a
                 JOIN courses c ON a.course_id = c.id
                 WHERE a.id = $1 AND c.teacher_id = $2`,
                [id, teacherId]
            );

            if (checkResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Assignment not found or access denied',
                });
            }

            await pool.query('DELETE FROM assignments WHERE id = $1', [id]);

            res.status(204).send();
        } catch (error) {
            req.log.error({ err: error }, 'Error deleting assignment');
            res.status(500).json({
                error: 'Internal server error',
            });
        }
    });
};
