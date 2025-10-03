const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

module.exports = (pool) => {
    // Get teacher analytics data
    router.get('/', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const teacherId = req.user.id;

            // Get students per course for this teacher
            const studentsPerCourseResult = await pool.query(
                `SELECT 
                    c.title as course,
                    COUNT(e.student_id) as students
                 FROM courses c
                 LEFT JOIN enrollments e ON c.id = e.course_id
                 WHERE c.teacher_id = $1
                 GROUP BY c.id, c.title
                 ORDER BY students DESC`,
                [teacherId]
            );

            const studentsPerCourse = studentsPerCourseResult.rows.map(row => ({
                course: row.course,
                students: parseInt(row.students) || 0
            }));

            // Get assignment status (completed vs pending)
            // Completed = has grade, Pending = no grade
            const assignmentStatusResult = await pool.query(
                `SELECT 
                    COUNT(CASE WHEN s.grade IS NOT NULL THEN 1 END) as completed,
                    COUNT(CASE WHEN s.grade IS NULL THEN 1 END) as pending
                 FROM submissions s
                 INNER JOIN assignments a ON s.assignment_id = a.id
                 INNER JOIN courses c ON a.course_id = c.id
                 WHERE c.teacher_id = $1`,
                [teacherId]
            );

            const statusData = assignmentStatusResult.rows[0];
            const assignmentStatus = [
                {
                    name: 'Completed',
                    value: parseInt(statusData.completed) || 0
                },
                {
                    name: 'Pending',
                    value: parseInt(statusData.pending) || 0
                }
            ];

            res.json({
                studentsPerCourse,
                assignmentStatus
            });
        } catch (error) {
            console.error('Error fetching teacher analytics:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    // Get detailed teacher analytics data
    router.get('/detailed', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const teacherId = req.user.id;

            // 1. Course Performance - Average grade per course
            const coursePerformanceResult = await pool.query(
                `SELECT 
                    c.title as course,
                    ROUND(AVG(s.grade)::numeric, 2) as performance
                 FROM courses c
                 LEFT JOIN assignments a ON c.id = a.course_id
                 LEFT JOIN submissions s ON a.id = s.assignment_id AND s.grade IS NOT NULL
                 WHERE c.teacher_id = $1
                 GROUP BY c.id, c.title
                 HAVING COUNT(s.id) > 0
                 ORDER BY performance DESC
                 LIMIT 5`,
                [teacherId]
            );

            const coursePerformance = coursePerformanceResult.rows.map(row => ({
                course: row.course,
                performance: parseFloat(row.performance) || 0
            }));

            // 2. Student Progress Over Time - Average grades by month
            const studentProgressResult = await pool.query(
                `SELECT 
                    TO_CHAR(s.submitted_at, 'Mon') as period,
                    ROUND(AVG(s.grade)::numeric, 2) as progress
                 FROM submissions s
                 INNER JOIN assignments a ON s.assignment_id = a.id
                 INNER JOIN courses c ON a.course_id = c.id
                 WHERE c.teacher_id = $1 
                   AND s.grade IS NOT NULL
                   AND s.submitted_at >= NOW() - INTERVAL '6 months'
                 GROUP BY TO_CHAR(s.submitted_at, 'Mon'), EXTRACT(MONTH FROM s.submitted_at)
                 ORDER BY EXTRACT(MONTH FROM s.submitted_at)`,
                [teacherId]
            );

            const studentProgress = studentProgressResult.rows.map(row => ({
                period: row.period,
                progress: parseFloat(row.progress) || 0
            }));

            // 3. Completion Rates - Percentage of submissions per assignment
            const completionRatesResult = await pool.query(
                `SELECT 
                    a.title as assignment,
                    ROUND((COUNT(DISTINCT s.student_id)::numeric / NULLIF(COUNT(DISTINCT e.student_id), 0) * 100)::numeric, 2) as rate
                 FROM assignments a
                 INNER JOIN courses c ON a.course_id = c.id
                 LEFT JOIN enrollments e ON c.id = e.course_id
                 LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = e.student_id
                 WHERE c.teacher_id = $1
                 GROUP BY a.id, a.title
                 HAVING COUNT(DISTINCT e.student_id) > 0
                 ORDER BY a.created_at DESC
                 LIMIT 5`,
                [teacherId]
            );

            const completionRates = completionRatesResult.rows.map(row => ({
                assignment: row.assignment,
                rate: Math.min(parseFloat(row.rate) || 0, 100) // Cap at 100%
            }));

            // 4. Grade Distribution - Count of grades in each range
            const gradeDistributionResult = await pool.query(
                `SELECT 
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
                    INNER JOIN assignments a ON s.assignment_id = a.id
                    INNER JOIN courses c ON a.course_id = c.id
                    WHERE c.teacher_id = $1 
                      AND s.grade IS NOT NULL
                 ) subquery
                 GROUP BY grade_range, sort_order
                 ORDER BY sort_order`,
                [teacherId]
            );

            const gradeDistribution = gradeDistributionResult.rows.map(row => ({
                name: row.name,
                value: parseInt(row.value) || 0
            }));

            res.json({
                coursePerformance,
                studentProgress,
                completionRates,
                gradeDistribution
            });
        } catch (error) {
            console.error('Error fetching detailed teacher analytics:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    return router;
};
