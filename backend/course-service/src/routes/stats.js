const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

module.exports = (pool) => {
    // Get teacher dashboard stats
    router.get('/', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const teacherId = req.user.id;

            // Get total courses for this teacher
            const coursesResult = await pool.query(
                'SELECT COUNT(*) as total FROM courses WHERE teacher_id = $1',
                [teacherId]
            );
            const totalCourses = parseInt(coursesResult.rows[0].total) || 0;

            // Get total students enrolled in all teacher's courses
            const studentsResult = await pool.query(
                `SELECT COUNT(DISTINCT e.student_id) as total
                 FROM enrollments e
                 INNER JOIN courses c ON e.course_id = c.id
                 WHERE c.teacher_id = $1`,
                [teacherId]
            );
            const totalStudents = parseInt(studentsResult.rows[0].total) || 0;

            // Get average grade across all submissions in teacher's courses
            const gradeResult = await pool.query(
                `SELECT AVG(s.grade) as average
                 FROM submissions s
                 INNER JOIN assignments a ON s.assignment_id = a.id
                 INNER JOIN courses c ON a.course_id = c.id
                 WHERE c.teacher_id = $1 AND s.grade IS NOT NULL`,
                [teacherId]
            );
            const averageGrade = gradeResult.rows[0].average
                ? parseFloat(gradeResult.rows[0].average).toFixed(1)
                : 0;

            // Get pending assignments to grade (submissions without a grade)
            const pendingResult = await pool.query(
                `SELECT COUNT(*) as total
                 FROM submissions s
                 INNER JOIN assignments a ON s.assignment_id = a.id
                 INNER JOIN courses c ON a.course_id = c.id
                 WHERE c.teacher_id = $1 AND s.grade IS NULL`,
                [teacherId]
            );
            const pendingAssignmentsToGrade = parseInt(pendingResult.rows[0].total) || 0;

            res.json({
                totalCourses,
                totalStudents,
                averageGrade: parseFloat(averageGrade),
                pendingAssignmentsToGrade
            });
        } catch (error) {
            console.error('Error fetching teacher stats:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    return router;
};
