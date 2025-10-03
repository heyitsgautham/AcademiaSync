const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

module.exports = (pool) => {
    // Get students grouped by course for the authenticated teacher
    router.get('/students-by-course', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const teacherId = req.user.id;

            // Get all courses for this teacher with enrolled students
            const coursesResult = await pool.query(
                `SELECT c.id as course_id, c.title as course_name
                 FROM courses c
                 WHERE c.teacher_id = $1
                 ORDER BY c.title`,
                [teacherId]
            );

            // For each course, get students with their performance
            const studentsByCourse = await Promise.all(
                coursesResult.rows.map(async (course) => {
                    // Get students enrolled in this course
                    const studentsResult = await pool.query(
                        `SELECT DISTINCT
                            u.id,
                            u.first_name,
                            u.last_name,
                            u.email,
                            u.profile_picture,
                            COALESCE(AVG(s.grade), 0) as performance
                         FROM enrollments e
                         INNER JOIN users u ON e.student_id = u.id
                         LEFT JOIN submissions s ON s.student_id = u.id
                         LEFT JOIN assignments a ON s.assignment_id = a.id AND a.course_id = e.course_id
                         WHERE e.course_id = $1 AND u.role = 'Student'
                         GROUP BY u.id, u.first_name, u.last_name, u.email, u.profile_picture
                         ORDER BY u.last_name, u.first_name`,
                        [course.course_id]
                    );

                    // Format students data
                    const students = studentsResult.rows.map(student => ({
                        id: student.id.toString(),
                        name: `${student.first_name} ${student.last_name}`,
                        email: student.email,
                        avatar: student.profile_picture || null,
                        performance: parseFloat(student.performance).toFixed(0)
                    }));

                    return {
                        courseId: course.course_id.toString(),
                        courseName: course.course_name,
                        students: students
                    };
                })
            );

            // Filter out courses with no students
            const filteredData = studentsByCourse.filter(course => course.students.length > 0);

            res.json(filteredData);
        } catch (error) {
            console.error('Error fetching students by course:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    return router;
};
