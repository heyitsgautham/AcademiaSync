-- ========================================
-- ASSIGNMENTS (3-5 assignments per course)
-- ========================================
DO $$
DECLARE
    course_id_var INTEGER;
    num_assignments INTEGER;
    assignment_num INTEGER;
    due_date_var TIMESTAMP;
    course_created_at TIMESTAMP;
BEGIN
    FOR course_id_var IN 1..75 LOOP
        -- Get course creation date
        SELECT created_at INTO course_created_at FROM courses WHERE id = course_id_var;
        
        -- 3 to 5 assignments per course
        num_assignments := 3 + (course_id_var % 3);
        
        FOR assignment_num IN 1..num_assignments LOOP
            -- Stagger due dates throughout the course
            due_date_var := course_created_at + (INTERVAL '1 week' * (assignment_num * 3));
            
            INSERT INTO assignments (course_id, title, description, due_date, created_at) VALUES
            (
                course_id_var,
                'Assignment ' || assignment_num || ': ' || 
                CASE assignment_num
                    WHEN 1 THEN 'Fundamentals and Basics'
                    WHEN 2 THEN 'Intermediate Concepts'
                    WHEN 3 THEN 'Advanced Topics'
                    WHEN 4 THEN 'Project Implementation'
                    WHEN 5 THEN 'Final Capstone Project'
                END,
                'Complete the tasks related to week ' || (assignment_num * 3) || ' material. Submit your work before the due date.',
                due_date_var,
                course_created_at + (INTERVAL '1 week' * (assignment_num * 3 - 2))
            );
        END LOOP;
    END LOOP;
END $$;
