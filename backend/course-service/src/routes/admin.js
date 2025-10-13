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
          teacher_id as "actorId",
          course_name as "courseName",
          course_id as "courseId",
          teacher_id as "teacherId",
          NULL as "studentName",
          NULL as "studentId",
          TO_CHAR(created_at, 'Mon DD, YYYY HH12:MI AM') as timestamp,
          created_at as sort_date
        FROM (
          SELECT 
            'created' as activity_type,
            c.id as course_id,
            c.title as course_name,
            c.teacher_id,
            CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) as teacher_name,
            u.profile_picture,
            c.created_at
          FROM courses c
          JOIN users u ON c.teacher_id = u.id
          
          UNION ALL
          
          SELECT 
            'updated' as activity_type,
            c.id as course_id,
            c.title as course_name,
            c.teacher_id,
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
          s.id as "actorId",
          c.title as "courseName",
          c.id as "courseId",
          c.teacher_id as "teacherId",
          CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) as "studentName",
          s.id as "studentId",
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
          actorId: activity.actorId,
          courseName: activity.courseName,
          courseId: activity.courseId,
          teacherId: activity.teacherId,
          studentName: activity.studentName,
          studentId: activity.studentId,
          timestamp: activity.timestamp
        }));

      res.json(allActivities);
    } catch (error) {
      console.error('Error fetching admin recent activity:', error);
      res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
  });

  /**
   * Get student's enrolled courses with grades (Admin)
   */
  router.get('/students/:studentId/courses', authenticate, authorize('Admin'), async (req, res) => {
    try {
      const { studentId } = req.params;

      // Get student info
      const studentResult = await pool.query(`
        SELECT id, first_name, last_name, email, profile_picture
        FROM users
        WHERE id = $1 AND role = 'Student'
      `, [studentId]);

      if (studentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const student = studentResult.rows[0];

      // Get enrolled courses with grades
      const coursesResult = await pool.query(`
        SELECT 
          c.id as course_id,
          c.title as course_title,
          c.description as course_description,
          CONCAT(t.first_name, ' ', COALESCE(t.last_name, '')) as instructor_name,
          t.id as instructor_id,
          e.enrolled_at,
          AVG(s.grade) as average_grade,
          COUNT(DISTINCT s.id) as total_submissions,
          COUNT(DISTINCT a.id) as total_assignments
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN users t ON c.teacher_id = t.id
        LEFT JOIN assignments a ON c.id = a.course_id
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = e.student_id AND s.grade IS NOT NULL
        WHERE e.student_id = $1
        GROUP BY c.id, c.title, c.description, t.first_name, t.last_name, t.id, e.enrolled_at
        ORDER BY e.enrolled_at DESC
      `, [studentId]);

      const courses = coursesResult.rows.map(row => ({
        courseId: row.course_id,
        courseTitle: row.course_title,
        courseDescription: row.course_description,
        instructorName: row.instructor_name,
        instructorId: row.instructor_id,
        averageGrade: row.average_grade ? parseFloat(row.average_grade) : null,
        totalSubmissions: parseInt(row.total_submissions) || 0,
        totalAssignments: parseInt(row.total_assignments) || 0
      }));

      res.json({
        studentId: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        email: student.email,
        profilePicture: student.profile_picture,
        courses
      });
    } catch (error) {
      console.error('Error fetching student courses:', error);
      res.status(500).json({ error: 'Failed to fetch student courses' });
    }
  });

  /**
   * Get teacher's courses with student count and avg grades (Admin)
   */
  router.get('/teachers/:teacherId/courses', authenticate, authorize('Admin'), async (req, res) => {
    try {
      const { teacherId } = req.params;

      // Get teacher info
      const teacherResult = await pool.query(`
        SELECT id, first_name, last_name, email, profile_picture, specialization
        FROM users
        WHERE id = $1 AND role = 'Teacher'
      `, [teacherId]);

      if (teacherResult.rows.length === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      const teacher = teacherResult.rows[0];

      // Get courses with stats
      const coursesResult = await pool.query(`
        SELECT 
          c.id as course_id,
          c.title as course_title,
          c.description as course_description,
          COUNT(DISTINCT e.student_id) as student_count,
          AVG(s.grade) as average_grade,
          COUNT(DISTINCT a.id) as total_assignments
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN assignments a ON c.id = a.course_id
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.grade IS NOT NULL
        WHERE c.teacher_id = $1
        GROUP BY c.id, c.title, c.description
        ORDER BY c.created_at DESC
      `, [teacherId]);

      const courses = coursesResult.rows.map(row => ({
        courseId: row.course_id,
        courseTitle: row.course_title,
        courseDescription: row.course_description,
        studentCount: parseInt(row.student_count) || 0,
        averageGrade: row.average_grade ? parseFloat(row.average_grade) : null,
        totalAssignments: parseInt(row.total_assignments) || 0
      }));

      res.json({
        teacherId: teacher.id,
        firstName: teacher.first_name,
        lastName: teacher.last_name,
        email: teacher.email,
        profilePicture: teacher.profile_picture,
        specialization: teacher.specialization,
        courses
      });
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      res.status(500).json({ error: 'Failed to fetch teacher courses' });
    }
  });

  /**
   * Get students in a specific course with their grades (Admin)
   */
  router.get('/courses/:courseId/students/grades', authenticate, authorize('Admin'), async (req, res) => {
    try {
      const { courseId } = req.params;

      // Get course info
      const courseResult = await pool.query(`
        SELECT 
          c.id as course_id,
          c.title as course_title,
          c.description as course_description,
          CONCAT(t.first_name, ' ', COALESCE(t.last_name, '')) as teacher_name,
          t.id as teacher_id
        FROM courses c
        JOIN users t ON c.teacher_id = t.id
        WHERE c.id = $1
      `, [courseId]);

      if (courseResult.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }

      const course = courseResult.rows[0];

      // Get enrolled students with their grades
      const studentsResult = await pool.query(`
        SELECT 
          s.id as student_id,
          s.first_name,
          s.last_name,
          s.email,
          s.profile_picture,
          AVG(sub.grade) as average_grade,
          COUNT(DISTINCT sub.id) as total_submissions,
          COUNT(DISTINCT a.id) as total_assignments
        FROM enrollments e
        JOIN users s ON e.student_id = s.id
        LEFT JOIN assignments a ON a.course_id = e.course_id
        LEFT JOIN submissions sub ON a.id = sub.assignment_id AND sub.student_id = s.id AND sub.grade IS NOT NULL
        WHERE e.course_id = $1
        GROUP BY s.id, s.first_name, s.last_name, s.email, s.profile_picture
        ORDER BY s.first_name, s.last_name
      `, [courseId]);

      const students = studentsResult.rows.map(row => ({
        studentId: row.student_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        profilePicture: row.profile_picture,
        averageGrade: row.average_grade ? parseFloat(row.average_grade) : null,
        totalSubmissions: parseInt(row.total_submissions) || 0,
        totalAssignments: parseInt(row.total_assignments) || 0
      }));

      res.json({
        courseId: course.course_id,
        courseTitle: course.course_title,
        courseDescription: course.course_description,
        teacherName: course.teacher_name,
        teacherId: course.teacher_id,
        students
      });
    } catch (error) {
      console.error('Error fetching course students:', error);
      res.status(500).json({ error: 'Failed to fetch course students' });
    }
  });

  return router;
};
