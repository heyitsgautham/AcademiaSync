const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validateIdParams } = require('../middleware/validate');
const adminQueries = require('../queries/admin');

module.exports = (pool) => {
    const router = express.Router();
    validateIdParams(router, ['studentId', 'teacherId', 'courseId']);
    router.use(authenticate, authorize('Admin'));

    /**
     * @swagger
     * /admin/courses:
     *   get:
     *     summary: Get all courses (Admin)
     *     tags: [Admin]
     *     description: Retrieve all courses in the system with teacher and enrollment information
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: List of all courses
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Admin role required
     *       500:
     *         description: Internal server error
     */
    router.get('/courses', async (req, res) => {
        try {
            res.json(await adminQueries.listCourses(pool));
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching admin courses');
            res.status(500).json({ error: 'Failed to fetch courses' });
        }
    });

    /**
     * @swagger
     * /admin/recent-activity:
     *   get:
     *     summary: Get recent admin activity
     *     tags: [Admin]
     *     description: Retrieve recent course CRUD operations and student enrollments
     *     security:
     *       - bearerAuth: []
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: Recent activity retrieved successfully
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Admin role required
     *       500:
     *         description: Internal server error
     */
    router.get('/recent-activity', async (req, res) => {
        try {
            res.json(await adminQueries.recentActivity(pool, 10));
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching admin recent activity');
            res.status(500).json({ error: 'Failed to fetch recent activity' });
        }
    });

    /**
     * Get student's enrolled courses with grades (Admin)
     */
    router.get('/students/:studentId/courses', async (req, res) => {
        try {
            const student = await adminQueries.studentCourses(pool, req.params.studentId);
            if (!student) return res.status(404).json({ error: 'Student not found' });
            res.json(student);
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching student courses');
            res.status(500).json({ error: 'Failed to fetch student courses' });
        }
    });

    /**
     * Get teacher's courses with student count and avg grades (Admin)
     */
    router.get('/teachers/:teacherId/courses', async (req, res) => {
        try {
            const teacher = await adminQueries.teacherCourses(pool, req.params.teacherId);
            if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
            res.json(teacher);
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching teacher courses');
            res.status(500).json({ error: 'Failed to fetch teacher courses' });
        }
    });

    /**
     * Get students in a specific course with their grades (Admin)
     */
    router.get('/courses/:courseId/students/grades', async (req, res) => {
        try {
            const course = await adminQueries.courseStudentGrades(pool, req.params.courseId);
            if (!course) return res.status(404).json({ error: 'Course not found' });
            res.json(course);
        } catch (error) {
            req.log.error({ err: error }, 'Error fetching course students');
            res.status(500).json({ error: 'Failed to fetch course students' });
        }
    });

    return router;
};
