const { authenticate, authorize } = require('../../middleware/auth');
const { validateBody } = require('../../middleware/validate');
const { gradeBody, bulkGradeBody } = require('../../schemas');
const {
    parsePagination,
    parseSorting,
    buildPaginationMeta,
    buildSubmissionsFilter,
} = require('../../utils/query-helpers');

/**
 * Submission review and grading, one at a time or in bulk.
 * @param {Router} router - Teacher assignment router
 * @param {Pool} pool - PostgreSQL connection pool
 */
module.exports = (router, pool) => {
    // Get all submissions for an assignment with student details (with pagination, filtering, sorting)
    router.get('/assignments/:assignmentId/submissions', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { assignmentId } = req.params;
            const teacherId = req.user.id;

            // Parse query parameters
            const { page, limit, offset } = parsePagination(req.query);
            const { orderByClause } = parseSorting(req.query, ['student_name', 'grade', 'submitted_at', 'status']);
            // $1 is the assignment id and $2 the course id, so filter placeholders start at $3
            const { whereClause, values } = buildSubmissionsFilter(req.query, 3);

            // Verify the assignment belongs to the teacher's course
            const assignmentCheck = await pool.query(
                `SELECT a.id, a.course_id, a.title, a.description, a.due_date
                 FROM assignments a
                 JOIN courses c ON a.course_id = c.id
                 WHERE a.id = $1 AND c.teacher_id = $2`,
                [assignmentId, teacherId]
            );

            if (assignmentCheck.rows.length === 0) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Assignment not found or access denied',
                });
            }

            const assignment = assignmentCheck.rows[0];

            // Get total count for pagination
            const countQuery = `
                SELECT COUNT(*) as total
                FROM users u
                JOIN enrollments e ON u.id = e.student_id
                LEFT JOIN submissions s ON u.id = s.student_id AND s.assignment_id = $1
                WHERE e.course_id = $2 AND u.role = 'Student' ${whereClause}
            `;
            const countResult = await pool.query(countQuery, [assignmentId, assignment.course_id, ...values]);
            const totalItems = parseInt(countResult.rows[0].total);

            // Get paginated submissions with filters and sorting
            const submissionsQuery = `
                SELECT
                    u.id as student_id,
                    CONCAT(u.first_name, ' ', u.last_name) as student_name,
                    u.email as student_email,
                    s.id as submission_id,
                    s.submission_text,
                    s.submitted_at,
                    s.grade,
                    s.feedback,
                    CASE
                        WHEN s.id IS NOT NULL THEN 'Submitted'
                        ELSE 'No submission'
                    END as status
                FROM users u
                JOIN enrollments e ON u.id = e.student_id
                LEFT JOIN submissions s ON u.id = s.student_id AND s.assignment_id = $1
                WHERE e.course_id = $2 AND u.role = 'Student' ${whereClause}
                ORDER BY ${orderByClause}
                LIMIT $${values.length + 3} OFFSET $${values.length + 4}
            `;
            const submissionsResult = await pool.query(submissionsQuery, [
                assignmentId,
                assignment.course_id,
                ...values,
                limit,
                offset,
            ]);

            // Build pagination metadata
            const pagination = buildPaginationMeta(totalItems, page, limit);

            res.json({
                assignment: {
                    id: assignment.id,
                    title: assignment.title,
                    description: assignment.description,
                    due_date: assignment.due_date,
                    course_id: assignment.course_id,
                },
                submissions: submissionsResult.rows,
                pagination,
            });
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching assignment submissions');
            res.status(500).json({
                error: 'Internal server error',
            });
        }
    });

    // Update a single submission (grade and feedback)
    router.put(
        '/submissions/:submissionId',
        authenticate,
        authorize('teacher'),
        validateBody(gradeBody),
        async (req, res) => {
            try {
                const { submissionId } = req.params;
                const { grade, feedback } = req.body;
                const teacherId = req.user.id;

                // Verify the submission belongs to an assignment in teacher's course
                const submissionCheck = await pool.query(
                    `SELECT s.id
                 FROM submissions s
                 JOIN assignments a ON s.assignment_id = a.id
                 JOIN courses c ON a.course_id = c.id
                 WHERE s.id = $1 AND c.teacher_id = $2`,
                    [submissionId, teacherId]
                );

                if (submissionCheck.rows.length === 0) {
                    return res.status(404).json({
                        error: 'Not found',
                        message: 'Submission not found or access denied',
                    });
                }

                const result = await pool.query(
                    `UPDATE submissions
                 SET grade = $1, feedback = $2
                 WHERE id = $3
                 RETURNING *`,
                    [grade, feedback, submissionId]
                );

                res.json(result.rows[0]);
            } catch (error) {
                req.log.error({ err: error }, 'Error updating submission');
                res.status(500).json({
                    error: 'Internal server error',
                });
            }
        }
    );

    // Bulk update submissions (grades and feedback)
    router.post(
        '/assignments/:assignmentId/submissions/bulk-grade',
        authenticate,
        authorize('teacher'),
        validateBody(bulkGradeBody),
        async (req, res) => {
            try {
                const { assignmentId } = req.params;
                const { submissions } = req.body;
                const teacherId = req.user.id;

                // Verify the assignment belongs to the teacher's course
                const assignmentCheck = await pool.query(
                    `SELECT a.id
                 FROM assignments a
                 JOIN courses c ON a.course_id = c.id
                 WHERE a.id = $1 AND c.teacher_id = $2`,
                    [assignmentId, teacherId]
                );

                if (assignmentCheck.rows.length === 0) {
                    return res.status(404).json({
                        error: 'Not found',
                        message: 'Assignment not found or access denied',
                    });
                }

                // Update each submission in a transaction
                const client = await pool.connect();
                try {
                    await client.query('BEGIN');

                    const updatePromises = submissions.map(async (sub) => {
                        const { submissionId, grade, feedback } = sub;

                        return client.query(
                            `UPDATE submissions
                         SET grade = $1, feedback = $2
                         WHERE id = $3 AND assignment_id = $4`,
                            [grade, feedback, submissionId, assignmentId]
                        );
                    });

                    await Promise.all(updatePromises);
                    await client.query('COMMIT');

                    res.json({
                        success: true,
                        message: `Successfully updated ${submissions.length} submissions`,
                        count: submissions.length,
                    });
                } catch (error) {
                    await client.query('ROLLBACK');
                    throw error;
                } finally {
                    client.release();
                }
            } catch (error) {
                req.log.error({ err: error }, 'Error bulk updating submissions');
                res.status(500).json({
                    error: 'Internal server error',
                });
            }
        }
    );
};
