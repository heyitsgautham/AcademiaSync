-- ========================================
-- SUMMARY STATISTICS
-- ========================================
-- Display summary
SELECT
    'Users' AS entity,
    COUNT(*) AS total,
    COUNT(*) FILTER (
        WHERE
            role = 'Admin'
    ) AS admins,
    COUNT(*) FILTER (
        WHERE
            role = 'Teacher'
    ) AS teachers,
    COUNT(*) FILTER (
        WHERE
            role = 'Student'
    ) AS students
FROM users
UNION ALL
SELECT 'Courses', COUNT(*), NULL, NULL, NULL
FROM courses
UNION ALL
SELECT 'Enrollments', COUNT(*), NULL, NULL, NULL
FROM enrollments
UNION ALL
SELECT 'Assignments', COUNT(*), NULL, NULL, NULL
FROM assignments
UNION ALL
SELECT
    'Submissions',
    COUNT(*),
    COUNT(*) FILTER (
        WHERE
            grade IS NOT NULL
    ) AS graded,
    COUNT(*) FILTER (
        WHERE
            grade IS NULL
    ) AS not_graded,
    COUNT(*) FILTER (
        WHERE
            submitted_at > (
                SELECT due_date
                FROM assignments
                WHERE
                    id = submissions.assignment_id
            )
    ) AS late
FROM submissions;

-- Show demo accounts
SELECT
    'Demo Accounts' AS info,
    email,
    role,
    first_name,
    last_name
FROM users
WHERE
    email IN (
        'heyitsgautham@gmail.com',
        'helloiamkishore@gmail.com',
        'xmyhiruthik2020@gmail.com'
    )
ORDER BY
    CASE role
        WHEN 'Admin' THEN 1
        WHEN 'Teacher' THEN 2
        WHEN 'Student' THEN 3
    END;
