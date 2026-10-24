-- ========================================
-- SUBMISSIONS (Various states: submitted, late, graded, not graded)
-- ========================================
DO $$
DECLARE
    enrollment_record RECORD;
    assignment_record RECORD;
    submission_date TIMESTAMP;
    grade_value DECIMAL(5,2);
    is_late BOOLEAN;
    is_graded BOOLEAN;
    has_submitted BOOLEAN;
    random_factor INTEGER;
BEGIN
    -- For each enrollment, check all assignments in that course
    FOR enrollment_record IN 
        SELECT e.student_id, e.course_id, e.enrolled_at
        FROM enrollments e
    LOOP
        FOR assignment_record IN
            SELECT a.id, a.due_date, a.created_at
            FROM assignments a
            WHERE a.course_id = enrollment_record.course_id
        LOOP
            -- Only create submission if student was enrolled before assignment was created
            IF enrollment_record.enrolled_at < assignment_record.created_at THEN
                
                random_factor := (enrollment_record.student_id + assignment_record.id) % 100;
                
                -- 85% of students submit (15% don't submit)
                has_submitted := random_factor < 85;
                
                IF has_submitted THEN
                    -- 20% of submissions are late
                    is_late := random_factor % 5 = 0;
                    
                    IF is_late THEN
                        -- Late submission: 1-7 days after due date
                        submission_date := assignment_record.due_date + (INTERVAL '1 day' * (1 + (random_factor % 7)));
                    ELSE
                        -- On-time submission: random time before due date
                        submission_date := assignment_record.due_date - (INTERVAL '1 hour' * (1 + (random_factor % 72)));
                    END IF;
                    
                    -- 75% of submissions are graded
                    is_graded := random_factor % 4 != 3;
                    
                    IF is_graded THEN
                        -- Generate grade based on student performance pattern
                        -- Some students consistently high, some medium, some low
                        CASE (enrollment_record.student_id % 5)
                            WHEN 0 THEN -- High performers: 85-100
                                grade_value := 85.0 + (random_factor % 16);
                            WHEN 1, 2 THEN -- Medium performers: 70-89
                                grade_value := 70.0 + (random_factor % 20);
                            WHEN 3 THEN -- Low performers: 50-75
                                grade_value := 50.0 + (random_factor % 26);
                            ELSE -- Struggling: 40-65
                                grade_value := 40.0 + (random_factor % 26);
                        END CASE;
                        
                        -- Late submissions get 10% penalty
                        IF is_late THEN
                            grade_value := GREATEST(0, grade_value - 10);
                        END IF;
                        
                        INSERT INTO submissions (assignment_id, student_id, submission_text, submitted_at, grade, feedback)
                        VALUES (
                            assignment_record.id,
                            enrollment_record.student_id,
                            'Submission for assignment ' || assignment_record.id || ' by student ' || enrollment_record.student_id,
                            submission_date,
                            grade_value,
                            CASE 
                                WHEN grade_value >= 90 THEN 'Excellent work! Great understanding of the concepts.'
                                WHEN grade_value >= 80 THEN 'Good job! Minor improvements needed.'
                                WHEN grade_value >= 70 THEN 'Satisfactory work. Review the feedback comments.'
                                WHEN grade_value >= 60 THEN 'Needs improvement. Please review the material.'
                                ELSE 'Significant gaps in understanding. Please seek help.'
                            END
                        );
                    ELSE
                        -- Not graded yet
                        INSERT INTO submissions (assignment_id, student_id, submission_text, submitted_at, grade, feedback)
                        VALUES (
                            assignment_record.id,
                            enrollment_record.student_id,
                            'Submission for assignment ' || assignment_record.id || ' by student ' || enrollment_record.student_id,
                            submission_date,
                            NULL,
                            NULL
                        );
                    END IF;
                END IF;
            END IF;
        END LOOP;
    END LOOP;
END $$;
