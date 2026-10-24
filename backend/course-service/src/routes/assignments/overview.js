const { authenticate, authorize } = require('../../middleware/auth');
const { formatTimeAgo } = require('../../utils/time');

/**
 * Cross-course views for the teacher dashboard: per-assignment status counts and recent submissions.
 * @param {Router} router - Teacher assignment router
 * @param {Pool} pool - PostgreSQL connection pool
 */
module.exports = (router, pool) => {
    // Get all assignments with status information for teacher
    router.get('/assignments-with-status', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const teacherId = req.user.id;
            const { status } = req.query;

            // Get all assignments for teacher's courses with submission stats
            const query = `
                SELECT 
                    a.id,
                    a.course_id,
                    a.title,
                    a.description,
                    a.due_date,
                    a.created_at,
                    a.updated_at,
                    c.title as course_name,
                    COUNT(DISTINCT e.student_id) as total_students,
                    COUNT(DISTINCT s.id) as total_submissions,
                    COUNT(DISTINCT CASE WHEN s.grade IS NOT NULL THEN s.id END) as graded_submissions,
                    COUNT(DISTINCT CASE WHEN s.submitted_at > a.due_date THEN s.id END) as late_submissions,
                    AVG(s.grade) as average_grade
                FROM assignments a
                JOIN courses c ON a.course_id = c.id
                LEFT JOIN enrollments e ON c.id = e.course_id
                LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = e.student_id
                WHERE c.teacher_id = $1
                GROUP BY a.id, c.title
                ORDER BY a.due_date DESC, a.created_at DESC
            `;

            const result = await pool.query(query, [teacherId]);

            // Process assignments to add status flags
            let assignments = result.rows.map((assignment) => {
                const totalStudents = parseInt(assignment.total_students) || 0;
                const totalSubmissions = parseInt(assignment.total_submissions) || 0;
                const gradedSubmissions = parseInt(assignment.graded_submissions) || 0;
                const lateSubmissions = parseInt(assignment.late_submissions) || 0;
                const notSubmitted = totalStudents - totalSubmissions;
                const submittedNotGraded = totalSubmissions - gradedSubmissions;
                const averageGrade = assignment.average_grade ? parseFloat(assignment.average_grade).toFixed(1) : null;

                return {
                    ...assignment,
                    total_students: totalStudents,
                    total_submissions: totalSubmissions,
                    graded_submissions: gradedSubmissions,
                    late_submissions: lateSubmissions,
                    not_submitted: notSubmitted,
                    submitted_not_graded: submittedNotGraded,
                    average_grade: averageGrade ? parseFloat(averageGrade) : null,
                    // Status flags for filtering
                    has_submissions: totalSubmissions > 0,
                    has_graded: gradedSubmissions > 0,
                    has_not_submitted: notSubmitted > 0,
                    has_late: lateSubmissions > 0,
                    is_overdue: assignment.due_date && new Date(assignment.due_date) < new Date(),
                };
            });

            // Filter by status if provided
            if (status) {
                switch (status) {
                    case 'submitted':
                        assignments = assignments.filter((a) => a.submitted_not_graded > 0);
                        break;
                    case 'not-submitted':
                        assignments = assignments.filter((a) => a.has_not_submitted);
                        break;
                    case 'graded':
                        assignments = assignments.filter((a) => a.has_graded);
                        break;
                    case 'late':
                        assignments = assignments.filter((a) => a.has_late);
                        break;
                }
            }

            res.json(assignments);
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching assignments with status');
            res.status(500).json({
                error: 'Internal server error',
            });
        }
    });

    // Get recent submissions for teacher's courses
    router.get('/recent-submissions', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const teacherId = req.user.id;
            const limit = parseInt(req.query.limit) || 10;

            // Get recent submissions with student, course, and assignment details
            const result = await pool.query(
                `SELECT 
                    s.id,
                    s.submitted_at,
                    s.grade,
                    u.id as student_id,
                    u.first_name || ' ' || u.last_name as student_name,
                    u.profile_picture,
                    c.id as course_id,
                    c.title as course_title,
                    a.id as assignment_id,
                    a.title as assignment_title,
                    a.due_date,
                    CASE 
                        WHEN s.grade IS NOT NULL THEN 'completed'
                        WHEN s.submitted_at > a.due_date THEN 'late'
                        ELSE 'pending'
                    END as status
                 FROM submissions s
                 INNER JOIN assignments a ON s.assignment_id = a.id
                 INNER JOIN courses c ON a.course_id = c.id
                 INNER JOIN users u ON s.student_id = u.id
                 WHERE c.teacher_id = $1
                 ORDER BY s.submitted_at DESC
                 LIMIT $2`,
                [teacherId, limit]
            );

            // Transform the data to match the frontend format
            const submissions = result.rows.map((row) => ({
                id: row.id.toString(),
                studentId: row.student_id,
                studentName: row.student_name,
                studentAvatar: row.profile_picture || null,
                course: row.course_title,
                courseId: row.course_id,
                assignment: row.assignment_title,
                assignmentId: row.assignment_id,
                status: row.status,
                submittedAt: formatTimeAgo(new Date(row.submitted_at)),
                grade: row.grade,
            }));

            res.json(submissions);
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching recent submissions');
            res.status(500).json({
                error: 'Internal server error',
            });
        }
    });
};
