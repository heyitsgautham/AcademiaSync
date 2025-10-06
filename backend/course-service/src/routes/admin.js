const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

module.exports = (pool) => {
  const router = express.Router();

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
  router.get('/courses', authenticate, authorize('Admin'), async (req, res) => {
    try {
      const result = await pool.query(`
                SELECT 
                    c.id, 
                    c.title, 
                    c.description, 
                    c.weeks, 
                    c.created_at, 
                    c.updated_at,
                    c.teacher_id,
                    CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) as teacher_name,
                    u.email as teacher_email,
                    COUNT(DISTINCT e.student_id) as students_enrolled
                FROM courses c
                LEFT JOIN users u ON c.teacher_id = u.id
                LEFT JOIN enrollments e ON c.id = e.course_id
                GROUP BY c.id, c.teacher_id, u.first_name, u.last_name, u.email
                ORDER BY c.created_at DESC
            `);

      // Transform to camelCase for frontend
      const courses = result.rows.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        weeks: course.weeks,
        teacherId: course.teacher_id,
        teacherName: course.teacher_name,
        teacherEmail: course.teacher_email,
        enrolledCount: parseInt(course.students_enrolled) || 0,
        createdAt: course.created_at,
        updatedAt: course.updated_at
      }));

      res.json(courses);
    } catch (error) {
      console.error('Error fetching admin courses:', error);
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
  router.get('/recent-activity', authenticate, authorize('Admin'), async (req, res) => {
    try {
      // Get recent course CRUD operations
      const courseActivity = await pool.query(`
        SELECT 
          'course_' || activity_type as type,
          teacher_name as "actorName",
          profile_picture as "actorAvatar",
          course_name as "courseName",
          NULL as "studentName",
          TO_CHAR(created_at, 'Mon DD, YYYY HH12:MI AM') as timestamp,
          created_at as sort_date
        FROM (
          SELECT 
            'created' as activity_type,
            c.title as course_name,
            CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) as teacher_name,
            u.profile_picture,
            c.created_at
          FROM courses c
          JOIN users u ON c.teacher_id = u.id
          
          UNION ALL
          
          SELECT 
            'updated' as activity_type,
            c.title as course_name,
            CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) as teacher_name,
            u.profile_picture,
            c.updated_at as created_at
          FROM courses c
          JOIN users u ON c.teacher_id = u.id
          WHERE c.updated_at IS NOT NULL AND c.updated_at != c.created_at
        ) as course_changes
        ORDER BY created_at DESC
        LIMIT 10
      `);

      // Get recent enrollments
      const enrollmentActivity = await pool.query(`
        SELECT 
          'student_enrolled' as type,
          CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) as "actorName",
          s.profile_picture as "actorAvatar",
          c.title as "courseName",
          CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) as "studentName",
          TO_CHAR(e.enrolled_at, 'Mon DD, YYYY HH12:MI AM') as timestamp,
          e.enrolled_at as sort_date
        FROM enrollments e
        JOIN users s ON e.student_id = s.id
        JOIN courses c ON e.course_id = c.id
        ORDER BY e.enrolled_at DESC
        LIMIT 10
      `);

      // Combine and sort all activities
      const allActivities = [
        ...courseActivity.rows,
        ...enrollmentActivity.rows
      ].sort((a, b) => new Date(b.sort_date) - new Date(a.sort_date))
        .slice(0, 10)
        .map((activity, index) => ({
          id: `activity-${index}`,
          type: activity.type,
          actorName: activity.actorName,
          actorAvatar: activity.actorAvatar,
          courseName: activity.courseName,
          studentName: activity.studentName,
          timestamp: activity.timestamp
        }));

      res.json(allActivities);
    } catch (error) {
      console.error('Error fetching admin recent activity:', error);
      res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
  });

  return router;
};
