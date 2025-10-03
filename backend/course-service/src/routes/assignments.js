const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

module.exports = (pool) => {
    // Get all assignments for a specific course
    router.get('/courses/:courseId/assignments', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { courseId } = req.params;
            const teacherId = req.user.id;

            // Verify the course belongs to the teacher
            const courseCheck = await pool.query(
                'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
                [courseId, teacherId]
            );

            if (courseCheck.rows.length === 0) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Course not found or access denied'
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

            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    // Create a new assignment for a course
    router.post('/courses/:courseId/assignments', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { courseId } = req.params;
            const { title, description, due_date } = req.body;
            const teacherId = req.user.id;

            // Validation
            if (!title || !description) {
                return res.status(400).json({
                    error: 'Bad request',
                    message: 'Title and description are required'
                });
            }

            // Verify the course belongs to the teacher
            const courseCheck = await pool.query(
                'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
                [courseId, teacherId]
            );

            if (courseCheck.rows.length === 0) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Course not found or access denied'
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
            console.error('Error creating assignment:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

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
                    message: 'Assignment not found or access denied'
                });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching assignment:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    // Update an assignment
    router.put('/assignments/:id', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { id } = req.params;
            const { title, description, due_date } = req.body;
            const teacherId = req.user.id;

            // Validation
            if (!title || !description) {
                return res.status(400).json({
                    error: 'Bad request',
                    message: 'Title and description are required'
                });
            }

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
                    message: 'Assignment not found or access denied'
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
            console.error('Error updating assignment:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

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
                    message: 'Assignment not found or access denied'
                });
            }

            await pool.query('DELETE FROM assignments WHERE id = $1', [id]);

            res.status(204).send();
        } catch (error) {
            console.error('Error deleting assignment:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    // Get all submissions for an assignment with student details
    router.get('/assignments/:assignmentId/submissions', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { assignmentId } = req.params;
            const teacherId = req.user.id;

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
                    message: 'Assignment not found or access denied'
                });
            }

            const assignment = assignmentCheck.rows[0];

            // Get all students enrolled in the course
            const enrolledStudents = await pool.query(
                `SELECT u.id, u.first_name, u.last_name, u.email
                 FROM users u
                 JOIN enrollments e ON u.id = e.student_id
                 WHERE e.course_id = $1 AND u.role = 'Student'
                 ORDER BY u.last_name, u.first_name`,
                [assignment.course_id]
            );

            // Get all submissions for this assignment
            const submissions = await pool.query(
                `SELECT s.id as submission_id, s.student_id, s.submission_text, 
                        s.submitted_at, s.grade, s.feedback
                 FROM submissions s
                 WHERE s.assignment_id = $1`,
                [assignmentId]
            );

            // Create a map of submissions by student_id
            const submissionMap = new Map();
            submissions.rows.forEach(sub => {
                submissionMap.set(sub.student_id, sub);
            });

            // Combine student data with submission data
            const studentsWithSubmissions = enrolledStudents.rows.map(student => {
                const submission = submissionMap.get(student.id);

                if (submission) {
                    return {
                        student_id: student.id,
                        student_name: `${student.first_name} ${student.last_name}`,
                        student_email: student.email,
                        submission_id: submission.submission_id,
                        submission_text: submission.submission_text,
                        submitted_at: submission.submitted_at,
                        grade: submission.grade,
                        feedback: submission.feedback,
                        status: 'Submitted'
                    };
                } else {
                    return {
                        student_id: student.id,
                        student_name: `${student.first_name} ${student.last_name}`,
                        student_email: student.email,
                        submission_id: null,
                        submission_text: null,
                        submitted_at: null,
                        grade: null,
                        feedback: null,
                        status: 'No submission'
                    };
                }
            });

            res.json({
                assignment: {
                    id: assignment.id,
                    title: assignment.title,
                    description: assignment.description,
                    due_date: assignment.due_date,
                    course_id: assignment.course_id
                },
                submissions: studentsWithSubmissions
            });
        } catch (error) {
            console.error('Error fetching assignment submissions:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    // Update a single submission (grade and feedback)
    router.put('/submissions/:submissionId', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { submissionId } = req.params;
            const { grade, feedback } = req.body;
            const teacherId = req.user.id;

            // Validation
            if (grade !== undefined && (grade < 0 || grade > 100)) {
                return res.status(400).json({
                    error: 'Bad request',
                    message: 'Grade must be between 0 and 100'
                });
            }

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
                    message: 'Submission not found or access denied'
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
            console.error('Error updating submission:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    // Bulk update submissions (grades and feedback)
    router.post('/assignments/:assignmentId/submissions/bulk-grade', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { assignmentId } = req.params;
            const { submissions } = req.body;
            const teacherId = req.user.id;

            // Validation
            if (!Array.isArray(submissions) || submissions.length === 0) {
                return res.status(400).json({
                    error: 'Bad request',
                    message: 'Submissions array is required and cannot be empty'
                });
            }

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
                    message: 'Assignment not found or access denied'
                });
            }

            // Update each submission in a transaction
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                const updatePromises = submissions.map(async (sub) => {
                    const { submissionId, grade, feedback } = sub;

                    // Validate grade
                    if (grade !== undefined && (grade < 0 || grade > 100)) {
                        throw new Error(`Invalid grade ${grade} for submission ${submissionId}`);
                    }

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
                    count: submissions.length
                });
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error bulk updating submissions:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    // Get all assignments with status information for teacher
    router.get('/assignments-with-status', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const teacherId = req.user.id;
            const { status } = req.query;

            // Get all assignments for teacher's courses with submission stats
            let query = `
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
            let assignments = result.rows.map(assignment => {
                const totalStudents = parseInt(assignment.total_students) || 0;
                const totalSubmissions = parseInt(assignment.total_submissions) || 0;
                const gradedSubmissions = parseInt(assignment.graded_submissions) || 0;
                const lateSubmissions = parseInt(assignment.late_submissions) || 0;
                const notSubmitted = totalStudents - totalSubmissions;
                const submittedNotGraded = totalSubmissions - gradedSubmissions;
                const averageGrade = assignment.average_grade 
                    ? parseFloat(assignment.average_grade).toFixed(1)
                    : null;

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
                    is_overdue: assignment.due_date && new Date(assignment.due_date) < new Date()
                };
            });

            // Filter by status if provided
            if (status) {
                switch (status) {
                    case 'submitted':
                        assignments = assignments.filter(a => a.submitted_not_graded > 0);
                        break;
                    case 'not-submitted':
                        assignments = assignments.filter(a => a.has_not_submitted);
                        break;
                    case 'graded':
                        assignments = assignments.filter(a => a.has_graded);
                        break;
                    case 'late':
                        assignments = assignments.filter(a => a.has_late);
                        break;
                }
            }

            res.json(assignments);
        } catch (error) {
            console.error('Error fetching assignments with status:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    return router;
};
