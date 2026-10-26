/**
 * Read queries behind the admin routes.
 * Each function takes the pool, runs parameterized SQL and returns camelCase objects,
 * so the routes only handle HTTP and these can be tested against Postgres directly.
 */

const toInt = (value) => parseInt(value) || 0;
const toGrade = (value) => (value === null || value === undefined ? null : parseFloat(value));

/**
 * Every course with its teacher and the number of distinct enrolled students, newest first.
 * @param {import('pg').Pool} pool
 */
const listCourses = async (pool) => {
    const { rows } = await pool.query(`
        SELECT
            c.id,
            c.title,
            c.description,
            c.weeks,
            c.created_at,
            c.updated_at,
            c.teacher_id,
            CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) AS teacher_name,
            u.email AS teacher_email,
            COUNT(DISTINCT e.student_id) AS students_enrolled
        FROM courses c
        LEFT JOIN users u ON c.teacher_id = u.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        GROUP BY c.id, c.teacher_id, u.first_name, u.last_name, u.email
        ORDER BY c.created_at DESC
    `);

    return rows.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        weeks: course.weeks,
        teacherId: course.teacher_id,
        teacherName: course.teacher_name,
        teacherEmail: course.teacher_email,
        enrolledCount: toInt(course.students_enrolled),
        createdAt: course.created_at,
        updatedAt: course.updated_at,
    }));
};

/**
 * Course creations and later edits, newest first.
 * An edit counts only when updated_at differs from created_at.
 * @param {import('pg').Pool} pool
 * @param {number} limit
 */
const recentCourseChanges = async (pool, limit) => {
    const { rows } = await pool.query(
        `
        SELECT
            'course_' || activity_type AS type,
            teacher_name AS "actorName",
            profile_picture AS "actorAvatar",
            teacher_id AS "actorId",
            course_name AS "courseName",
            course_id AS "courseId",
            teacher_id AS "teacherId",
            NULL AS "studentName",
            NULL AS "studentId",
            TO_CHAR(created_at, 'Mon DD, YYYY HH12:MI AM') AS timestamp,
            created_at AS sort_date
        FROM (
            SELECT
                'created' AS activity_type,
                c.id AS course_id,
                c.title AS course_name,
                c.teacher_id,
                CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) AS teacher_name,
                u.profile_picture,
                c.created_at
            FROM courses c
            JOIN users u ON c.teacher_id = u.id

            UNION ALL

            SELECT
                'updated' AS activity_type,
                c.id AS course_id,
                c.title AS course_name,
                c.teacher_id,
                CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) AS teacher_name,
                u.profile_picture,
                c.updated_at AS created_at
            FROM courses c
            JOIN users u ON c.teacher_id = u.id
            WHERE c.updated_at IS NOT NULL AND c.updated_at != c.created_at
        ) AS course_changes
        ORDER BY created_at DESC
        LIMIT $1
    `,
        [limit]
    );
    return rows;
};

/**
 * Student enrollments, newest first.
 * @param {import('pg').Pool} pool
 * @param {number} limit
 */
const recentEnrollments = async (pool, limit) => {
    const { rows } = await pool.query(
        `
        SELECT
            'student_enrolled' AS type,
            CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS "actorName",
            s.profile_picture AS "actorAvatar",
            s.id AS "actorId",
            c.title AS "courseName",
            c.id AS "courseId",
            c.teacher_id AS "teacherId",
            CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS "studentName",
            s.id AS "studentId",
            TO_CHAR(e.enrolled_at, 'Mon DD, YYYY HH12:MI AM') AS timestamp,
            e.enrolled_at AS sort_date
        FROM enrollments e
        JOIN users s ON e.student_id = s.id
        JOIN courses c ON e.course_id = c.id
        ORDER BY e.enrolled_at DESC
        LIMIT $1
    `,
        [limit]
    );
    return rows;
};

/**
 * Merges activity rows from several sources into one feed, newest first, with ids by position.
 * @param {Array<Array<object>>} sources - Row lists that each carry a sort_date
 * @param {number} limit
 */
const mergeActivity = (sources, limit) =>
    sources
        .flat()
        .sort((a, b) => new Date(b.sort_date) - new Date(a.sort_date))
        .slice(0, limit)
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
            timestamp: activity.timestamp,
        }));

/**
 * The latest course changes and enrollments as one feed.
 * @param {import('pg').Pool} pool
 * @param {number} [limit=10]
 */
const recentActivity = async (pool, limit = 10) => {
    const [courseChanges, enrollments] = await Promise.all([
        recentCourseChanges(pool, limit),
        recentEnrollments(pool, limit),
    ]);
    return mergeActivity([courseChanges, enrollments], limit);
};

/**
 * A student and each course they are enrolled in, with their average graded score.
 * @param {import('pg').Pool} pool
 * @param {number} studentId
 * @returns {Promise<object|null>} null when no student has that id
 */
const studentCourses = async (pool, studentId) => {
    const studentResult = await pool.query(
        `SELECT id, first_name, last_name, email, profile_picture
         FROM users
         WHERE id = $1 AND role = 'Student'`,
        [studentId]
    );
    if (studentResult.rows.length === 0) return null;
    const student = studentResult.rows[0];

    const { rows } = await pool.query(
        `
        SELECT
            c.id AS course_id,
            c.title AS course_title,
            c.description AS course_description,
            CONCAT(t.first_name, ' ', COALESCE(t.last_name, '')) AS instructor_name,
            t.id AS instructor_id,
            e.enrolled_at,
            AVG(s.grade) AS average_grade,
            COUNT(DISTINCT s.id) AS total_submissions,
            COUNT(DISTINCT a.id) AS total_assignments
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN users t ON c.teacher_id = t.id
        LEFT JOIN assignments a ON c.id = a.course_id
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = e.student_id AND s.grade IS NOT NULL
        WHERE e.student_id = $1
        GROUP BY c.id, c.title, c.description, t.first_name, t.last_name, t.id, e.enrolled_at
        ORDER BY e.enrolled_at DESC
    `,
        [studentId]
    );

    return {
        studentId: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        email: student.email,
        profilePicture: student.profile_picture,
        courses: rows.map((row) => ({
            courseId: row.course_id,
            courseTitle: row.course_title,
            courseDescription: row.course_description,
            instructorName: row.instructor_name,
            instructorId: row.instructor_id,
            averageGrade: toGrade(row.average_grade),
            totalSubmissions: toInt(row.total_submissions),
            totalAssignments: toInt(row.total_assignments),
        })),
    };
};

/**
 * A teacher and each of their courses with enrollment, assignment and grade totals.
 * @param {import('pg').Pool} pool
 * @param {number} teacherId
 * @returns {Promise<object|null>} null when no teacher has that id
 */
const teacherCourses = async (pool, teacherId) => {
    const teacherResult = await pool.query(
        `SELECT id, first_name, last_name, email, profile_picture, specialization
         FROM users
         WHERE id = $1 AND role = 'Teacher'`,
        [teacherId]
    );
    if (teacherResult.rows.length === 0) return null;
    const teacher = teacherResult.rows[0];

    const { rows } = await pool.query(
        `
        SELECT
            c.id AS course_id,
            c.title AS course_title,
            c.description AS course_description,
            COUNT(DISTINCT e.student_id) AS student_count,
            AVG(s.grade) AS average_grade,
            COUNT(DISTINCT a.id) AS total_assignments
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN assignments a ON c.id = a.course_id
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.grade IS NOT NULL
        WHERE c.teacher_id = $1
        GROUP BY c.id, c.title, c.description
        ORDER BY c.created_at DESC
    `,
        [teacherId]
    );

    return {
        teacherId: teacher.id,
        firstName: teacher.first_name,
        lastName: teacher.last_name,
        email: teacher.email,
        profilePicture: teacher.profile_picture,
        specialization: teacher.specialization,
        courses: rows.map((row) => ({
            courseId: row.course_id,
            courseTitle: row.course_title,
            courseDescription: row.course_description,
            studentCount: toInt(row.student_count),
            averageGrade: toGrade(row.average_grade),
            totalAssignments: toInt(row.total_assignments),
        })),
    };
};

/**
 * A course, its teacher, and each enrolled student's average graded score.
 * @param {import('pg').Pool} pool
 * @param {number} courseId
 * @returns {Promise<object|null>} null when no course has that id
 */
const courseStudentGrades = async (pool, courseId) => {
    const courseResult = await pool.query(
        `SELECT
            c.id AS course_id,
            c.title AS course_title,
            c.description AS course_description,
            CONCAT(t.first_name, ' ', COALESCE(t.last_name, '')) AS teacher_name,
            t.id AS teacher_id
         FROM courses c
         JOIN users t ON c.teacher_id = t.id
         WHERE c.id = $1`,
        [courseId]
    );
    if (courseResult.rows.length === 0) return null;
    const course = courseResult.rows[0];

    const { rows } = await pool.query(
        `
        SELECT
            s.id AS student_id,
            s.first_name,
            s.last_name,
            s.email,
            s.profile_picture,
            AVG(sub.grade) AS average_grade,
            COUNT(DISTINCT sub.id) AS total_submissions,
            COUNT(DISTINCT a.id) AS total_assignments
        FROM enrollments e
        JOIN users s ON e.student_id = s.id
        LEFT JOIN assignments a ON a.course_id = e.course_id
        LEFT JOIN submissions sub ON a.id = sub.assignment_id AND sub.student_id = s.id AND sub.grade IS NOT NULL
        WHERE e.course_id = $1
        GROUP BY s.id, s.first_name, s.last_name, s.email, s.profile_picture
        ORDER BY s.first_name, s.last_name
    `,
        [courseId]
    );

    return {
        courseId: course.course_id,
        courseTitle: course.course_title,
        courseDescription: course.course_description,
        teacherName: course.teacher_name,
        teacherId: course.teacher_id,
        students: rows.map((row) => ({
            studentId: row.student_id,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            profilePicture: row.profile_picture,
            averageGrade: toGrade(row.average_grade),
            totalSubmissions: toInt(row.total_submissions),
            totalAssignments: toInt(row.total_assignments),
        })),
    };
};

module.exports = {
    listCourses,
    recentActivity,
    mergeActivity,
    studentCourses,
    teacherCourses,
    courseStudentGrades,
};
