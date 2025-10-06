const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

module.exports = (pool) => {
  const router = express.Router();

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
