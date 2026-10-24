-- ========================================
-- ENROLLMENTS (Students enrolled in courses)
-- ========================================

-- The demo student account enrolls in a fixed set of courses.
-- It is looked up by email because its id depends on how many admins and teachers come before it.
INSERT INTO
    enrollments (student_id, course_id, enrolled_at)
SELECT demo.id, picked.course_id, picked.enrolled_at
FROM users demo
CROSS JOIN (
    VALUES
        (1, NOW() - INTERVAL '250 days'), -- Intro to Programming (Demo Teacher's Course)
        (2, NOW() - INTERVAL '220 days'), -- Data Structures (Demo Teacher's Course)
        (3, NOW() - INTERVAL '200 days'), -- Database Systems (Demo Teacher's Course)
        (12, NOW() - INTERVAL '180 days'), -- Analytical Chemistry
        (13, NOW() - INTERVAL '160 days'), -- Molecular Biology
        (49, NOW() - INTERVAL '140 days'), -- User Experience Design
        (50, NOW() - INTERVAL '120 days'), -- UI Design Fundamentals
        (51, NOW() - INTERVAL '100 days') -- Design Systems
) AS picked (course_id, enrolled_at)
WHERE demo.email = 'xmyhiruthik2020@gmail.com';

-- Distribute remaining students across courses (each student enrolls in 4-6 courses)
-- This will create approximately 450-550 enrollments
DO $$
DECLARE
    student_record RECORD;
    course_id_var INTEGER;
    num_courses INTEGER;
    enrollment_date TIMESTAMP;
BEGIN
    FOR student_record IN 
        SELECT id, created_at 
        FROM users 
        WHERE role = 'Student' AND email <> 'xmyhiruthik2020@gmail.com'
        ORDER BY id
    LOOP
        num_courses := 4 + (student_record.id % 3); -- 4, 5, or 6 courses per student
        
        FOR i IN 1..num_courses LOOP
            -- Select a random course (1-75)
            course_id_var := 1 + ((student_record.id * i + 13) % 75);
            enrollment_date := student_record.created_at + INTERVAL '1 day';
            
            -- Insert if not already enrolled (avoid duplicates)
            INSERT INTO enrollments (student_id, course_id, enrolled_at)
            VALUES (student_record.id, course_id_var, enrollment_date)
            ON CONFLICT (student_id, course_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
