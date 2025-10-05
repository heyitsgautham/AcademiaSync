const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { addCourseLinks, addAssignmentLinks, addSubmissionLinks, addStudentDashboardLinks } = require('../utils/hateoas');

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
            const coursesWithLinks = result.rows.map(course =>
                addCourseLinks(course, 'Student', false)
            );

            res.json({
                courses: coursesWithLinks,
                _links: addStudentDashboardLinks()
            });
        } catch (error) {
            console.error('Error fetching available courses:', error);
            res.status(500).json({
                error: 'Failed to fetch available courses',
                message: error.message
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
                    error: 'Assignment not found or you are not enrolled in this course'
                });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching assignment details:', error);
            res.status(500).json({
                error: 'Failed to fetch assignment details',
                message: error.message
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

            // Get student info
            const studentQuery = `
        SELECT CONCAT(first_name, ' ', last_name) as name, email
        FROM users
        WHERE id = $1
      `;
            const studentResult = await pool.query(studentQuery, [studentId]);

            // Get enrolled courses count
            const coursesQuery = `
        SELECT COUNT(*) as count
        FROM enrollments
        WHERE student_id = $1
      `;
            const coursesResult = await pool.query(coursesQuery, [studentId]);

            // Get assignments due count (pending assignments)
            const assignmentsDueQuery = `
        SELECT COUNT(*) as count
        FROM assignments a
        INNER JOIN courses c ON a.course_id = c.id
        INNER JOIN enrollments e ON c.id = e.course_id AND e.student_id = $1
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = $1
        WHERE s.id IS NULL
      `;
            const assignmentsDueResult = await pool.query(assignmentsDueQuery, [studentId]);

            // Get graded assignments count
            const gradedAssignmentsQuery = `
        SELECT COUNT(*) as count
        FROM submissions
        WHERE student_id = $1 AND grade IS NOT NULL
      `;
            const gradedAssignmentsResult = await pool.query(gradedAssignmentsQuery, [studentId]);

            // Get average grade
            const gradeQuery = `
        SELECT ROUND(AVG(grade)::numeric, 2) as average
        FROM submissions
        WHERE student_id = $1 AND grade IS NOT NULL
      `;
            const gradeResult = await pool.query(gradeQuery, [studentId]);

            // Get recent activity (last 5 submissions with more details)
            const activityQuery = `
        SELECT 
          s.id,
          s.assignment_id as "assignmentId",
          a.id as "assignmentId",
          a.title as assignment,
          c.id as "courseId",
          c.title as course,
          TO_CHAR(s.submitted_at, 'Mon DD, YYYY HH24:MI') as "submittedAt",
          s.grade,
          CASE
            WHEN s.grade IS NOT NULL THEN 'graded'
            ELSE 'submitted'
          END as status
        FROM submissions s
        INNER JOIN assignments a ON s.assignment_id = a.id
        INNER JOIN courses c ON a.course_id = c.id
        WHERE s.student_id = $1
        ORDER BY s.submitted_at DESC
        LIMIT 5
      `;
            const activityResult = await pool.query(activityQuery, [studentId]);

            // Analytics: Course Progress (for dashboard chart 1)
            const courseProgressQuery = `
        SELECT 
          c.title as course,
          ROUND((COUNT(DISTINCT s.assignment_id)::numeric / NULLIF(COUNT(DISTINCT a.id), 0) * 100)::numeric, 2) as progress
        FROM courses c
        INNER JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN assignments a ON c.id = a.course_id
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = e.student_id
        WHERE e.student_id = $1
        GROUP BY c.id, c.title
        HAVING COUNT(DISTINCT a.id) > 0
        ORDER BY progress DESC
        LIMIT 5
      `;
            const courseProgressResult = await pool.query(courseProgressQuery, [studentId]);

            // Analytics: Submission Status (for dashboard chart 2)
            const submissionStatusQuery = `
        SELECT 
          'Graded' as name,
          COUNT(CASE WHEN s.grade IS NOT NULL THEN 1 END) as value
        FROM assignments a
        INNER JOIN courses c ON a.course_id = c.id
        INNER JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = e.student_id
        WHERE e.student_id = $1
        UNION ALL
        SELECT 
          'Submitted' as name,
          COUNT(CASE WHEN s.id IS NOT NULL AND s.grade IS NULL THEN 1 END) as value
        FROM assignments a
        INNER JOIN courses c ON a.course_id = c.id
        INNER JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = e.student_id
        WHERE e.student_id = $1
        UNION ALL
        SELECT 
          'Pending' as name,
          COUNT(CASE WHEN s.id IS NULL THEN 1 END) as value
        FROM assignments a
        INNER JOIN courses c ON a.course_id = c.id
        INNER JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = e.student_id
        WHERE e.student_id = $1
      `;
            const submissionStatusResult = await pool.query(submissionStatusQuery, [studentId]);

            res.json({
                student: studentResult.rows[0] || { name: 'Student', email: '' },
                stats: {
                    totalCourses: parseInt(coursesResult.rows[0].count) || 0,
                    assignmentsDue: parseInt(assignmentsDueResult.rows[0].count) || 0,
                    averageGrade: parseFloat(gradeResult.rows[0].average) || 0,
                    gradedAssignments: parseInt(gradedAssignmentsResult.rows[0].count) || 0
                },
                recentActivity: activityResult.rows,
                analytics: {
                    courseProgress: courseProgressResult.rows.map(row => ({
                        course: row.course,
                        progress: Math.min(parseFloat(row.progress) || 0, 100)
                    })),
                    submissionStatus: submissionStatusResult.rows.map(row => ({
                        name: row.name,
                        value: parseInt(row.value) || 0
                    }))
                }
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            res.status(500).json({
                error: 'Failed to fetch dashboard data',
                message: error.message
            });
        }
    });

    /**
     * GET /api/student/analytics
     * Returns detailed analytics data for the student
     * Query params: filter (weekly, biweekly, monthly)
     */
    router.get('/analytics', async (req, res) => {
        try {
            const studentId = req.user.id;
            const filter = req.query.filter || 'weekly';

            // Determine time interval and grouping
            let interval, dateFormat, gradesGroupBy, completionGroupBy;
            switch (filter) {
                case 'weekly':
                    interval = '7 weeks';
                    dateFormat = 'YYYY-IW'; // ISO week number
                    gradesGroupBy = `TO_CHAR(s.submitted_at, 'YYYY-IW')`;
                    completionGroupBy = `TO_CHAR(a.due_date, 'YYYY-IW')`;
                    break;
                case 'biweekly':
                    interval = '14 weeks';
                    dateFormat = 'YYYY-IW';
                    gradesGroupBy = `TO_CHAR(s.submitted_at, 'YYYY-IW')`;
                    completionGroupBy = `TO_CHAR(a.due_date, 'YYYY-IW')`;
                    break;
                case 'monthly':
                    interval = '6 months';
                    dateFormat = 'Mon YYYY';
                    gradesGroupBy = `TO_CHAR(s.submitted_at, 'Mon YYYY'), EXTRACT(YEAR FROM s.submitted_at), EXTRACT(MONTH FROM s.submitted_at)`;
                    completionGroupBy = `TO_CHAR(a.due_date, 'Mon YYYY'), EXTRACT(YEAR FROM a.due_date), EXTRACT(MONTH FROM a.due_date)`;
                    break;
                default:
                    interval = '7 weeks';
                    dateFormat = 'YYYY-IW';
                    gradesGroupBy = `TO_CHAR(s.submitted_at, 'YYYY-IW')`;
                    completionGroupBy = `TO_CHAR(a.due_date, 'YYYY-IW')`;
            }

            // 1. Grade Trends - Average grade over time
            const gradeTrendsQuery = `
                SELECT 
                    TO_CHAR(s.submitted_at, '${dateFormat}') as period,
                    ROUND(AVG(s.grade)::numeric, 2) as grade
                FROM submissions s
                WHERE s.student_id = $1 
                  AND s.grade IS NOT NULL
                  AND s.submitted_at >= NOW() - INTERVAL '${interval}'
                GROUP BY ${gradesGroupBy}
                ORDER BY ${gradesGroupBy}
            `;
            const gradeTrendsResult = await pool.query(gradeTrendsQuery, [studentId]);

            // 2. Assignment Completion - Completed vs Total assignments over time
            const completionQuery = `
                SELECT 
                    TO_CHAR(a.due_date, '${dateFormat}') as period,
                    COUNT(CASE WHEN s.id IS NOT NULL THEN 1 END) as completed,
                    COUNT(a.id) as total
                FROM assignments a
                INNER JOIN enrollments e ON a.course_id = e.course_id
                LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = e.student_id
                WHERE e.student_id = $1
                  AND a.due_date >= NOW() - INTERVAL '${interval}'
                GROUP BY ${completionGroupBy}
                ORDER BY ${completionGroupBy}
            `;
            const completionResult = await pool.query(completionQuery, [studentId]);

            // 3. Course Progress - Progress percentage per course
            const courseProgressQuery = `
                SELECT 
                    c.title as course,
                    ROUND((COUNT(DISTINCT s.assignment_id)::numeric / NULLIF(COUNT(DISTINCT a.id), 0) * 100)::numeric, 2) as progress
                FROM courses c
                INNER JOIN enrollments e ON c.id = e.course_id
                LEFT JOIN assignments a ON c.id = a.course_id
                LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = e.student_id
                WHERE e.student_id = $1
                GROUP BY c.id, c.title
                HAVING COUNT(DISTINCT a.id) > 0
                ORDER BY progress DESC
                LIMIT 5
            `;
            const courseProgressResult = await pool.query(courseProgressQuery, [studentId]);

            // 4. Grade Distribution - Count of grades in each range
            const gradeDistributionQuery = `
                SELECT 
                    grade_range as name,
                    COUNT(*) as value
                FROM (
                    SELECT 
                        CASE 
                            WHEN s.grade >= 90 THEN 'A (90-100)'
                            WHEN s.grade >= 80 THEN 'B (80-89)'
                            WHEN s.grade >= 70 THEN 'C (70-79)'
                            WHEN s.grade >= 60 THEN 'D (60-69)'
                            ELSE 'F (0-59)'
                        END as grade_range,
                        CASE 
                            WHEN s.grade >= 90 THEN 1
                            WHEN s.grade >= 80 THEN 2
                            WHEN s.grade >= 70 THEN 3
                            WHEN s.grade >= 60 THEN 4
                            ELSE 5
                        END as sort_order
                    FROM submissions s
                    WHERE s.student_id = $1 
                      AND s.grade IS NOT NULL
                ) subquery
                GROUP BY grade_range, sort_order
                ORDER BY sort_order
            `;
            const gradeDistributionResult = await pool.query(gradeDistributionQuery, [studentId]);

            // Format the data
            const gradeTrends = gradeTrendsResult.rows.map(row => ({
                period: row.period,
                grade: parseFloat(row.grade) || 0
            }));

            const assignmentCompletion = completionResult.rows.map(row => ({
                period: row.period,
                completed: parseInt(row.completed) || 0,
                total: parseInt(row.total) || 0
            }));

            const courseProgress = courseProgressResult.rows.map(row => ({
                course: row.course,
                progress: Math.min(parseFloat(row.progress) || 0, 100) // Cap at 100%
            }));

            const gradeDistribution = gradeDistributionResult.rows.map(row => ({
                name: row.name,
                value: parseInt(row.value) || 0
            }));

            res.json({
                gradeTrends,
                assignmentCompletion,
                courseProgress,
                gradeDistribution
            });
        } catch (error) {
            console.error('Error fetching student analytics:', error);
            res.status(500).json({
                error: 'Failed to fetch student analytics',
                message: error.message
            });
        }
    });

    return router;
};
