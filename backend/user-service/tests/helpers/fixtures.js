const jwt = require('jsonwebtoken');

/**
 * Small factories that insert rows through the service's own pool,
 * so every test starts from an empty database and builds only what it needs.
 */
const createFixtures = (pool) => {
    let counter = 0;
    const next = () => {
        counter += 1;
        return counter;
    };

    const resetDatabase = () =>
        pool.query(
            'TRUNCATE refresh_tokens, submissions, assignments, enrollments, courses, users RESTART IDENTITY CASCADE'
        );

    const createUser = async (role, overrides = {}) => {
        const n = next();
        const { rows } = await pool.query(
            `INSERT INTO users (email, role, first_name, last_name, age, specialization)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                overrides.email || `${role.toLowerCase()}${n}@example.com`,
                role,
                overrides.first_name || `${role}${n}`,
                overrides.last_name || 'Tester',
                overrides.age || null,
                overrides.specialization || null,
            ]
        );
        return rows[0];
    };

    const createCourse = async (teacherId, overrides = {}) => {
        const n = next();
        const { rows } = await pool.query(
            `INSERT INTO courses (title, description, teacher_id, weeks, created_at)
             VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_TIMESTAMP)) RETURNING *`,
            [
                overrides.title || `Course ${n}`,
                overrides.description || `Description ${n}`,
                teacherId,
                overrides.weeks || 8,
                overrides.created_at || null,
            ]
        );
        return rows[0];
    };

    const enroll = async (studentId, courseId) => {
        const { rows } = await pool.query(
            'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *',
            [studentId, courseId]
        );
        return rows[0];
    };

    const createAssignment = async (courseId, overrides = {}) => {
        const n = next();
        const { rows } = await pool.query(
            `INSERT INTO assignments (course_id, title, description, due_date)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [
                courseId,
                overrides.title || `Assignment ${n}`,
                overrides.description || `Question ${n}`,
                overrides.due_date === undefined ? new Date(Date.now() + 7 * 86400000) : overrides.due_date,
            ]
        );
        return rows[0];
    };

    const createSubmission = async (assignmentId, studentId, overrides = {}) => {
        const { rows } = await pool.query(
            `INSERT INTO submissions (assignment_id, student_id, submission_text, grade, feedback, submitted_at)
             VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_TIMESTAMP)) RETURNING *`,
            [
                assignmentId,
                studentId,
                overrides.submission_text || 'My answer',
                overrides.grade === undefined ? null : overrides.grade,
                overrides.feedback || null,
                overrides.submitted_at || null,
            ]
        );
        return rows[0];
    };

    return { resetDatabase, createUser, createCourse, enroll, createAssignment, createSubmission };
};

/** Signs an access token the same way user-service does. */
const tokenFor = (user) =>
    jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '15m',
    });

const authHeader = (user) => ({ Authorization: `Bearer ${tokenFor(user)}` });

module.exports = { createFixtures, tokenFor, authHeader };
