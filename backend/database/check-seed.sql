-- Data checks for a database loaded with seed-demo-data.sql.
-- CI runs this after the seed. Any failed check raises an exception, so psql exits non-zero.

DO $$
DECLARE
    bad INTEGER;
BEGIN
    -- The demo accounts the README points people to must exist with their roles
    SELECT COUNT(*) INTO bad FROM (VALUES
        ('heyitsgautham@gmail.com', 'Admin'),
        ('helloiamkishore@gmail.com', 'Teacher')
    ) AS expected(email, role)
    WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.email = expected.email AND u.role = expected.role);
    IF bad > 0 THEN RAISE EXCEPTION 'missing demo account(s): %', bad; END IF;

    -- Every course belongs to a teacher
    SELECT COUNT(*) INTO bad FROM courses c JOIN users u ON u.id = c.teacher_id WHERE u.role <> 'Teacher';
    IF bad > 0 THEN RAISE EXCEPTION '% course(s) owned by a non-teacher', bad; END IF;

    -- Only students enroll
    SELECT COUNT(*) INTO bad FROM enrollments e JOIN users u ON u.id = e.student_id WHERE u.role <> 'Student';
    IF bad > 0 THEN RAISE EXCEPTION '% enrollment(s) for a non-student', bad; END IF;

    -- A submission needs an enrollment in the assignment's course
    SELECT COUNT(*) INTO bad
    FROM submissions s
    JOIN assignments a ON a.id = s.assignment_id
    LEFT JOIN enrollments e ON e.course_id = a.course_id AND e.student_id = s.student_id
    WHERE e.id IS NULL;
    IF bad > 0 THEN RAISE EXCEPTION '% submission(s) from students not enrolled in the course', bad; END IF;

    -- Grades use the same 0 to 100 scale the API enforces
    SELECT COUNT(*) INTO bad FROM submissions WHERE grade < 0 OR grade > 100;
    IF bad > 0 THEN RAISE EXCEPTION '% grade(s) outside 0-100', bad; END IF;

    -- Feedback only exists on graded work
    SELECT COUNT(*) INTO bad FROM submissions WHERE grade IS NULL AND feedback IS NOT NULL;
    IF bad > 0 THEN RAISE EXCEPTION '% ungraded submission(s) with feedback', bad; END IF;

    -- Every course has assignments, so dashboards have something to show
    SELECT COUNT(*) INTO bad FROM courses c WHERE NOT EXISTS (SELECT 1 FROM assignments a WHERE a.course_id = c.id);
    IF bad > 0 THEN RAISE EXCEPTION '% course(s) without assignments', bad; END IF;

    -- Demo rows were never edited, so nothing should look updated after it was created
    SELECT (SELECT COUNT(*) FROM users WHERE updated_at <> created_at)
         + (SELECT COUNT(*) FROM courses WHERE updated_at <> created_at)
         + (SELECT COUNT(*) FROM assignments WHERE updated_at <> created_at)
      INTO bad;
    IF bad > 0 THEN RAISE EXCEPTION '% seeded row(s) look edited after creation', bad; END IF;

    RAISE NOTICE 'seed checks passed';
END $$;
