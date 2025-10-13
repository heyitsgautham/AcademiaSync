const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { parsePagination, parseSorting, buildPaginationMeta, buildStudentsFilter } = require('../utils/query-helpers');

module.exports = (pool) => {
    // Get students grouped by course for the authenticated teacher (with pagination, filtering, sorting)
    router.get('/students-by-course', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const teacherId = req.user.id;

            // Parse query parameters
            const { page, limit, offset } = parsePagination(req.query);
            const { orderByClause } = parseSorting(req.query, ['course_name', 'performance', 'name']);
            const { whereClause, values } = buildStudentsFilter(req.query);

            // Get total count for pagination (count of courses with students)
            const countQuery = `
                SELECT COUNT(DISTINCT c.id) as total
                FROM courses c
                INNER JOIN enrollments e ON c.id = e.course_id
                INNER JOIN users u ON e.student_id = u.id
                WHERE c.teacher_id = $1 AND u.role = 'Student' ${whereClause}
            `;
            const countResult = await pool.query(countQuery, [teacherId, ...values]);
            const totalItems = parseInt(countResult.rows[0].total);

            // Get paginated courses with student counts
            const coursesQuery = `
                SELECT
                    c.id as course_id,
                    c.title as course_name,
                    COUNT(DISTINCT u.id) as student_count
                FROM courses c
                INNER JOIN enrollments e ON c.id = e.course_id
                INNER JOIN users u ON e.student_id = u.id
                WHERE c.teacher_id = $1 AND u.role = 'Student' ${whereClause}
                GROUP BY c.id, c.title
                ORDER BY ${orderByClause}
                LIMIT $${values.length + 2} OFFSET $${values.length + 3}
            `;
            const coursesResult = await pool.query(coursesQuery, [teacherId, ...values, limit, offset]);

            // For each course, get students with their performance
            const studentsByCourse = await Promise.all(
                coursesResult.rows.map(async (course) => {
                    // Get students enrolled in this course with performance
                    const studentsQuery = `
                        SELECT DISTINCT
                            u.id,
                            u.first_name,
                            u.last_name,
                            u.email,
                            u.profile_picture,
                            COALESCE(AVG(CASE WHEN a.course_id = e.course_id THEN s.grade END), 0) as performance
                         FROM enrollments e
                         INNER JOIN users u ON e.student_id = u.id
                         LEFT JOIN submissions s ON s.student_id = u.id
                         LEFT JOIN assignments a ON s.assignment_id = a.id
                         WHERE e.course_id = $1 AND u.role = 'Student'
                         GROUP BY u.id, u.first_name, u.last_name, u.email, u.profile_picture, e.course_id
                         ORDER BY u.last_name, u.first_name
                    `;
                    const studentsResult = await pool.query(studentsQuery, [course.course_id]);

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
                        students: students,
                        studentCount: parseInt(course.student_count)
                    };
                })
            );

            // Build pagination metadata
            const pagination = buildPaginationMeta(totalItems, page, limit);

            res.json({
                data: studentsByCourse,
                pagination
            });
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
