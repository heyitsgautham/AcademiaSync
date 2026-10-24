/**
 * SQL shared by the student and teacher analytics endpoints.
 */

/**
 * Counts graded submissions per letter band, A first.
 * @param {string} gradedSubmissions - FROM and WHERE clauses that select the submissions to count, aliased `s`
 * @returns {string} SQL returning rows of { name, value }
 */
const gradeDistributionQuery = (gradedSubmissions) => `
    SELECT grade_range AS name, COUNT(*) AS value
    FROM (
        SELECT
            CASE
                WHEN s.grade >= 90 THEN 'A (90-100)'
                WHEN s.grade >= 80 THEN 'B (80-89)'
                WHEN s.grade >= 70 THEN 'C (70-79)'
                WHEN s.grade >= 60 THEN 'D (60-69)'
                ELSE 'F (0-59)'
            END AS grade_range,
            CASE
                WHEN s.grade >= 90 THEN 1
                WHEN s.grade >= 80 THEN 2
                WHEN s.grade >= 70 THEN 3
                WHEN s.grade >= 60 THEN 4
                ELSE 5
            END AS sort_order
        ${gradedSubmissions}
    ) banded
    GROUP BY grade_range, sort_order
    ORDER BY sort_order
`;

/** Converts COUNT(*) strings from pg into numbers. */
const toGradeDistribution = (rows) => rows.map((row) => ({ name: row.name, value: parseInt(row.value) || 0 }));

/**
 * Percentage of each enrolled course's assignments the student has submitted, top five.
 * Courses without assignments are left out. Takes the student id as $1.
 */
const STUDENT_COURSE_PROGRESS_QUERY = `
    SELECT
        c.title AS course,
        ROUND((COUNT(DISTINCT s.assignment_id)::numeric / NULLIF(COUNT(DISTINCT a.id), 0) * 100)::numeric, 2) AS progress
    FROM courses c
    INNER JOIN enrollments e ON c.id = e.course_id
    LEFT JOIN assignments a ON c.id = a.course_id
    LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = e.student_id
    WHERE e.student_id = $1
    GROUP BY c.id, c.title
    HAVING COUNT(DISTINCT a.id) > 0
    ORDER BY progress DESC
    LIMIT 5
`;

/** Converts progress strings into numbers capped at 100. */
const toCourseProgress = (rows) =>
    rows.map((row) => ({ course: row.course, progress: Math.min(parseFloat(row.progress) || 0, 100) }));

module.exports = { gradeDistributionQuery, toGradeDistribution, STUDENT_COURSE_PROGRESS_QUERY, toCourseProgress };
