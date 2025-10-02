const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * Student routes for course enrollment and assignment submission
 * @param {Pool} pool - PostgreSQL connection pool
 * @returns {Router} Express router
 */
module.exports = (pool) => {
    const router = express.Router();

    // Apply authentication and authorization middleware to all routes
    router.use(authenticate);
    router.use(authorize('Student'));

    /**
     * GET /api/student/available-courses
     * Returns all courses the student is NOT enrolled in
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
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching available courses:', error);
            res.status(500).json({
                error: 'Failed to fetch available courses',
                message: error.message
            });
        }
    });

    /**
     * POST /api/student/enroll
     * Enrolls student in a course
     */
    router.post('/enroll', async (req, res) => {
        try {
            const studentId = req.user.id;
            const { courseId } = req.body;

            if (!courseId) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'courseId is required'
                });
            }

            // Check if course exists
            const courseCheck = await pool.query(
                'SELECT id FROM courses WHERE id = $1',
                [courseId]
            );

            if (courseCheck.rows.length === 0) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Course not found'
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
                    message: 'Already enrolled in this course'
                });
            }

            // Create enrollment
            await pool.query(
                'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)',
                [studentId, courseId]
            );

            res.json({
                success: true,
                message: 'Successfully enrolled in course'
            });
        } catch (error) {
            console.error('Error enrolling in course:', error);
            res.status(500).json({
                error: 'Failed to enroll in course',
                message: error.message
            });
        }
    });

    /**
     * GET /api/student/courses
     * Returns all courses the student IS enrolled in
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
          CONCAT(u.first_name, ' ', u.last_name) as instructor,
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
        GROUP BY c.id, c.title, u.first_name, u.last_name
        ORDER BY c.created_at DESC
      `;
            const coursesResult = await pool.query(coursesQuery, [studentId]);

            res.json({
                student: studentResult.rows[0],
                courses: coursesResult.rows
            });
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            res.status(500).json({
                error: 'Failed to fetch enrolled courses',
                message: error.message
            });
        }
    });

    /**
     * GET /api/student/assignments
     * Returns all assignments for enrolled courses
     */
    router.get('/assignments', async (req, res) => {
        try {
            const studentId = req.user.id;

            // Get student info
            const studentQuery = `
        SELECT CONCAT(first_name, ' ', last_name) as name, email
        FROM users
        WHERE id = $1
      `;
            const studentResult = await pool.query(studentQuery, [studentId]);

            // Get all assignments for enrolled courses
            const assignmentsQuery = `
        SELECT 
          a.id,
          a.title as name,
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
        ORDER BY a.due_date ASC
      `;
            const assignmentsResult = await pool.query(assignmentsQuery, [studentId]);

            // Get enrolled courses list
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
                courses: coursesResult.rows
            });
        } catch (error) {
            console.error('Error fetching assignments:', error);
            res.status(500).json({
                error: 'Failed to fetch assignments',
                message: error.message
            });
        }
    });

    /**
     * POST /api/student/submit-assignment
     * Submit or update an assignment submission
     */
    router.post('/submit-assignment', async (req, res) => {
        try {
            const studentId = req.user.id;
            const { assignmentId, submission, fileName } = req.body;

            if (!assignmentId || !submission) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'assignmentId and submission are required'
                });
            }

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
                    message: 'Assignment not found or you are not enrolled in this course'
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
                message: 'Assignment submitted successfully'
            });
        } catch (error) {
            console.error('Error submitting assignment:', error);
            res.status(500).json({
                error: 'Failed to submit assignment',
                message: error.message
            });
        }
    });

    /**
     * GET /api/student/dashboard
     * Returns dashboard data for the student
     */
    router.get('/dashboard', async (req, res) => {
        try {
            const studentId = req.user.id;

            // Get enrolled courses count
            const coursesQuery = `
        SELECT COUNT(*) as count
        FROM enrollments
        WHERE student_id = $1
      `;
            const coursesResult = await pool.query(coursesQuery, [studentId]);

            // Get pending assignments count (not submitted)
            const pendingQuery = `
        SELECT COUNT(*) as count
        FROM assignments a
        INNER JOIN courses c ON a.course_id = c.id
        INNER JOIN enrollments e ON c.id = e.course_id AND e.student_id = $1
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = $1
        WHERE s.id IS NULL
      `;
            const pendingResult = await pool.query(pendingQuery, [studentId]);

            // Get submitted assignments count
            const submittedQuery = `
        SELECT COUNT(*) as count
        FROM submissions
        WHERE student_id = $1
      `;
            const submittedResult = await pool.query(submittedQuery, [studentId]);

            // Get average grade
            const gradeQuery = `
        SELECT ROUND(AVG(grade)::numeric, 2) as average
        FROM submissions
        WHERE student_id = $1 AND grade IS NOT NULL
      `;
            const gradeResult = await pool.query(gradeQuery, [studentId]);

            // Get recent activity (last 5 submissions)
            const activityQuery = `
        SELECT 
          a.title as assignment,
          c.title as course,
          TO_CHAR(s.submitted_at, 'YYYY-MM-DD HH24:MI') as submittedAt,
          s.grade
        FROM submissions s
        INNER JOIN assignments a ON s.assignment_id = a.id
        INNER JOIN courses c ON a.course_id = c.id
        WHERE s.student_id = $1
        ORDER BY s.submitted_at DESC
        LIMIT 5
      `;
            const activityResult = await pool.query(activityQuery, [studentId]);

            res.json({
                enrolledCourses: parseInt(coursesResult.rows[0].count),
                pendingAssignments: parseInt(pendingResult.rows[0].count),
                submittedAssignments: parseInt(submittedResult.rows[0].count),
                averageGrade: gradeResult.rows[0].average || 0,
                recentActivity: activityResult.rows
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            res.status(500).json({
                error: 'Failed to fetch dashboard data',
                message: error.message
            });
        }
    });

    return router;
};
