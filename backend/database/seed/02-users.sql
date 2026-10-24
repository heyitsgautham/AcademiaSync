-- ========================================
-- DEMO USERS (Admin, Teacher, Student)
-- ========================================

-- Admin User (Demo Account)
INSERT INTO
    users (email, google_id, role, first_name, last_name, age, created_at)
VALUES ('heyitsgautham@gmail.com', 'admin_gautham_123', 'Admin', 'Gautham', 'Krishna', 28, NOW() - INTERVAL '365 days');

-- Additional Admins (9 more to make 10 total)
INSERT INTO
    users (email, role, first_name, last_name, age, created_at)
VALUES ('admin.sarah.wilson@academiasync.edu', 'Admin', 'Sarah', 'Wilson', 35, NOW() - INTERVAL '300 days'),
    ('admin.michael.brown@academiasync.edu', 'Admin', 'Michael', 'Brown', 42, NOW() - INTERVAL '280 days'),
    ('admin.emily.davis@academiasync.edu', 'Admin', 'Emily', 'Davis', 31, NOW() - INTERVAL '250 days'),
    ('admin.james.taylor@academiasync.edu', 'Admin', 'James', 'Taylor', 38, NOW() - INTERVAL '220 days'),
    ('admin.olivia.moore@academiasync.edu', 'Admin', 'Olivia', 'Moore', 29, NOW() - INTERVAL '200 days'),
    ('admin.william.anderson@academiasync.edu', 'Admin', 'William', 'Anderson', 45, NOW() - INTERVAL '180 days'),
    ('admin.sophia.thomas@academiasync.edu', 'Admin', 'Sophia', 'Thomas', 33, NOW() - INTERVAL '150 days'),
    ('admin.benjamin.jackson@academiasync.edu', 'Admin', 'Benjamin', 'Jackson', 36, NOW() - INTERVAL '120 days'),
    ('admin.ava.white@academiasync.edu', 'Admin', 'Ava', 'White', 30, NOW() - INTERVAL '90 days');

-- Teacher User (Demo Account)
INSERT INTO
    users (email, google_id, role, first_name, last_name, age, specialization, created_at)
VALUES ('helloiamkishore@gmail.com', 'teacher_kishore_456', 'Teacher', 'Kishore', 'Kumar', 32, 'Computer Science', NOW() - INTERVAL '320 days');

-- Additional Teachers (24 more to make 25 total)
INSERT INTO
    users (email, role, first_name, last_name, age, specialization, created_at)
VALUES ('teacher.robert.johnson@academiasync.edu', 'Teacher', 'Robert', 'Johnson', 45, 'Mathematics', NOW() - INTERVAL '310 days'),
    ('teacher.maria.garcia@academiasync.edu', 'Teacher', 'Maria', 'Garcia', 38, 'Physics', NOW() - INTERVAL '300 days'),
    ('teacher.david.martinez@academiasync.edu', 'Teacher', 'David', 'Martinez', 41, 'Chemistry', NOW() - INTERVAL '290 days'),
    ('teacher.jennifer.rodriguez@academiasync.edu', 'Teacher', 'Jennifer', 'Rodriguez', 36, 'Biology', NOW() - INTERVAL '280 days'),
    ('teacher.christopher.wilson@academiasync.edu', 'Teacher', 'Christopher', 'Wilson', 43, 'Computer Science', NOW() - INTERVAL '270 days'),
    ('teacher.linda.lopez@academiasync.edu', 'Teacher', 'Linda', 'Lopez', 39, 'Data Science', NOW() - INTERVAL '260 days'),
    ('teacher.daniel.gonzalez@academiasync.edu', 'Teacher', 'Daniel', 'Gonzalez', 37, 'Artificial Intelligence', NOW() - INTERVAL '250 days'),
    ('teacher.patricia.hernandez@academiasync.edu', 'Teacher', 'Patricia', 'Hernandez', 42, 'Machine Learning', NOW() - INTERVAL '240 days'),
    ('teacher.matthew.moore@academiasync.edu', 'Teacher', 'Matthew', 'Moore', 40, 'Web Development', NOW() - INTERVAL '230 days'),
    ('teacher.barbara.martin@academiasync.edu', 'Teacher', 'Barbara', 'Martin', 44, 'Database Systems', NOW() - INTERVAL '220 days'),
    ('teacher.joseph.jackson@academiasync.edu', 'Teacher', 'Joseph', 'Jackson', 35, 'Cybersecurity', NOW() - INTERVAL '210 days'),
    ('teacher.susan.lee@academiasync.edu', 'Teacher', 'Susan', 'Lee', 38, 'Cloud Computing', NOW() - INTERVAL '200 days'),
    ('teacher.thomas.perez@academiasync.edu', 'Teacher', 'Thomas', 'Perez', 46, 'Software Engineering', NOW() - INTERVAL '190 days'),
    ('teacher.karen.thompson@academiasync.edu', 'Teacher', 'Karen', 'Thompson', 34, 'Mobile Development', NOW() - INTERVAL '180 days'),
    ('teacher.charles.white@academiasync.edu', 'Teacher', 'Charles', 'White', 41, 'DevOps', NOW() - INTERVAL '170 days'),
    ('teacher.nancy.harris@academiasync.edu', 'Teacher', 'Nancy', 'Harris', 37, 'UI/UX Design', NOW() - INTERVAL '160 days'),
    ('teacher.paul.sanchez@academiasync.edu', 'Teacher', 'Paul', 'Sanchez', 39, 'Blockchain', NOW() - INTERVAL '150 days'),
    ('teacher.betty.clark@academiasync.edu', 'Teacher', 'Betty', 'Clark', 43, 'IoT', NOW() - INTERVAL '140 days'),
    ('teacher.mark.ramirez@academiasync.edu', 'Teacher', 'Mark', 'Ramirez', 36, 'Game Development', NOW() - INTERVAL '130 days'),
    ('teacher.helen.lewis@academiasync.edu', 'Teacher', 'Helen', 'Lewis', 40, 'Computer Networks', NOW() - INTERVAL '120 days'),
    ('teacher.donald.robinson@academiasync.edu', 'Teacher', 'Donald', 'Robinson', 45, 'Operating Systems', NOW() - INTERVAL '110 days'),
    ('teacher.michelle.walker@academiasync.edu', 'Teacher', 'Michelle', 'Walker', 33, 'Computer Graphics', NOW() - INTERVAL '100 days'),
    ('teacher.kenneth.young@academiasync.edu', 'Teacher', 'Kenneth', 'Young', 42, 'Natural Language Processing', NOW() - INTERVAL '90 days'),
    ('teacher.laura.allen@academiasync.edu', 'Teacher', 'Laura', 'Allen', 35, 'Computer Vision', NOW() - INTERVAL '80 days'),
    ('teacher.steven.king@academiasync.edu', 'Teacher', 'Steven', 'King', 44, 'Robotics', NOW() - INTERVAL '70 days');

-- Student User (Demo Account)
INSERT INTO
    users (email, google_id, role, first_name, last_name, age, created_at)
VALUES ('xmyhiruthik2020@gmail.com', 'student_hiruthik_789', 'Student', 'Hiruthik', 'M', 22, NOW() - INTERVAL '200 days');

-- Additional Students (99 more to make 100 total)
INSERT INTO
    users (email, role, first_name, last_name, age, created_at)
VALUES ('student.alice.brown@student.edu', 'Student', 'Alice', 'Brown', 20, NOW() - INTERVAL '190 days'),
    ('student.bob.williams@student.edu', 'Student', 'Bob', 'Williams', 21, NOW() - INTERVAL '188 days'),
    ('student.carol.jones@student.edu', 'Student', 'Carol', 'Jones', 19, NOW() - INTERVAL '186 days'),
    ('student.dave.miller@student.edu', 'Student', 'Dave', 'Miller', 22, NOW() - INTERVAL '184 days'),
    ('student.eve.davis@student.edu', 'Student', 'Eve', 'Davis', 20, NOW() - INTERVAL '182 days'),
    ('student.frank.garcia@student.edu', 'Student', 'Frank', 'Garcia', 23, NOW() - INTERVAL '180 days'),
    ('student.grace.martinez@student.edu', 'Student', 'Grace', 'Martinez', 21, NOW() - INTERVAL '178 days'),
    ('student.henry.rodriguez@student.edu', 'Student', 'Henry', 'Rodriguez', 20, NOW() - INTERVAL '176 days'),
    ('student.ivy.wilson@student.edu', 'Student', 'Ivy', 'Wilson', 19, NOW() - INTERVAL '174 days'),
    ('student.jack.lopez@student.edu', 'Student', 'Jack', 'Lopez', 22, NOW() - INTERVAL '172 days'),
    ('student.kate.gonzalez@student.edu', 'Student', 'Kate', 'Gonzalez', 21, NOW() - INTERVAL '170 days'),
    ('student.leo.hernandez@student.edu', 'Student', 'Leo', 'Hernandez', 20, NOW() - INTERVAL '168 days'),
    ('student.mia.moore@student.edu', 'Student', 'Mia', 'Moore', 23, NOW() - INTERVAL '166 days'),
    ('student.noah.martin@student.edu', 'Student', 'Noah', 'Martin', 19, NOW() - INTERVAL '164 days'),
    ('student.olivia.jackson@student.edu', 'Student', 'Olivia', 'Jackson', 22, NOW() - INTERVAL '162 days'),
    ('student.peter.lee@student.edu', 'Student', 'Peter', 'Lee', 21, NOW() - INTERVAL '160 days'),
    ('student.quinn.perez@student.edu', 'Student', 'Quinn', 'Perez', 20, NOW() - INTERVAL '158 days'),
    ('student.ryan.thompson@student.edu', 'Student', 'Ryan', 'Thompson', 19, NOW() - INTERVAL '156 days'),
    ('student.sarah.white@student.edu', 'Student', 'Sarah', 'White', 22, NOW() - INTERVAL '154 days'),
    ('student.tom.harris@student.edu', 'Student', 'Tom', 'Harris', 21, NOW() - INTERVAL '152 days'),
    ('student.uma.sanchez@student.edu', 'Student', 'Uma', 'Sanchez', 20, NOW() - INTERVAL '150 days'),
    ('student.victor.clark@student.edu', 'Student', 'Victor', 'Clark', 23, NOW() - INTERVAL '148 days'),
    ('student.wendy.ramirez@student.edu', 'Student', 'Wendy', 'Ramirez', 19, NOW() - INTERVAL '146 days'),
    ('student.xavier.lewis@student.edu', 'Student', 'Xavier', 'Lewis', 22, NOW() - INTERVAL '144 days'),
    ('student.yara.robinson@student.edu', 'Student', 'Yara', 'Robinson', 21, NOW() - INTERVAL '142 days'),
    ('student.zack.walker@student.edu', 'Student', 'Zack', 'Walker', 20, NOW() - INTERVAL '140 days'),
    ('student.amy.young@student.edu', 'Student', 'Amy', 'Young', 19, NOW() - INTERVAL '138 days'),
    ('student.brian.allen@student.edu', 'Student', 'Brian', 'Allen', 22, NOW() - INTERVAL '136 days'),
    ('student.cathy.king@student.edu', 'Student', 'Cathy', 'King', 21, NOW() - INTERVAL '134 days'),
    ('student.derek.wright@student.edu', 'Student', 'Derek', 'Wright', 20, NOW() - INTERVAL '132 days'),
    ('student.emma.scott@student.edu', 'Student', 'Emma', 'Scott', 23, NOW() - INTERVAL '130 days'),
    ('student.felix.torres@student.edu', 'Student', 'Felix', 'Torres', 19, NOW() - INTERVAL '128 days'),
    ('student.gina.nguyen@student.edu', 'Student', 'Gina', 'Nguyen', 22, NOW() - INTERVAL '126 days'),
    ('student.hugo.hill@student.edu', 'Student', 'Hugo', 'Hill', 21, NOW() - INTERVAL '124 days'),
    ('student.iris.flores@student.edu', 'Student', 'Iris', 'Flores', 20, NOW() - INTERVAL '122 days'),
    ('student.jason.green@student.edu', 'Student', 'Jason', 'Green', 19, NOW() - INTERVAL '120 days'),
    ('student.kelly.adams@student.edu', 'Student', 'Kelly', 'Adams', 22, NOW() - INTERVAL '118 days'),
    ('student.luke.nelson@student.edu', 'Student', 'Luke', 'Nelson', 21, NOW() - INTERVAL '116 days'),
    ('student.maya.baker@student.edu', 'Student', 'Maya', 'Baker', 20, NOW() - INTERVAL '114 days'),
    ('student.nick.hall@student.edu', 'Student', 'Nick', 'Hall', 23, NOW() - INTERVAL '112 days'),
    ('student.owen.rivera@student.edu', 'Student', 'Owen', 'Rivera', 19, NOW() - INTERVAL '110 days'),
    ('student.penny.campbell@student.edu', 'Student', 'Penny', 'Campbell', 22, NOW() - INTERVAL '108 days'),
    ('student.quincy.mitchell@student.edu', 'Student', 'Quincy', 'Mitchell', 21, NOW() - INTERVAL '106 days'),
    ('student.ruby.carter@student.edu', 'Student', 'Ruby', 'Carter', 20, NOW() - INTERVAL '104 days'),
    ('student.sam.roberts@student.edu', 'Student', 'Sam', 'Roberts', 19, NOW() - INTERVAL '102 days'),
    ('student.tina.gomez@student.edu', 'Student', 'Tina', 'Gomez', 22, NOW() - INTERVAL '100 days'),
    ('student.ursula.phillips@student.edu', 'Student', 'Ursula', 'Phillips', 21, NOW() - INTERVAL '98 days'),
    ('student.vince.evans@student.edu', 'Student', 'Vince', 'Evans', 20, NOW() - INTERVAL '96 days'),
    ('student.wanda.turner@student.edu', 'Student', 'Wanda', 'Turner', 23, NOW() - INTERVAL '94 days'),
    ('student.xander.diaz@student.edu', 'Student', 'Xander', 'Diaz', 19, NOW() - INTERVAL '92 days'),
    ('student.yasmin.parker@student.edu', 'Student', 'Yasmin', 'Parker', 22, NOW() - INTERVAL '90 days'),
    ('student.zoe.cruz@student.edu', 'Student', 'Zoe', 'Cruz', 21, NOW() - INTERVAL '88 days'),
    ('student.aaron.edwards@student.edu', 'Student', 'Aaron', 'Edwards', 20, NOW() - INTERVAL '86 days'),
    ('student.bella.collins@student.edu', 'Student', 'Bella', 'Collins', 19, NOW() - INTERVAL '84 days'),
    ('student.carl.reyes@student.edu', 'Student', 'Carl', 'Reyes', 22, NOW() - INTERVAL '82 days'),
    ('student.diana.stewart@student.edu', 'Student', 'Diana', 'Stewart', 21, NOW() - INTERVAL '80 days'),
    ('student.ethan.morris@student.edu', 'Student', 'Ethan', 'Morris', 20, NOW() - INTERVAL '78 days'),
    ('student.fiona.morales@student.edu', 'Student', 'Fiona', 'Morales', 23, NOW() - INTERVAL '76 days'),
    ('student.george.murphy@student.edu', 'Student', 'George', 'Murphy', 19, NOW() - INTERVAL '74 days'),
    ('student.hannah.cook@student.edu', 'Student', 'Hannah', 'Cook', 22, NOW() - INTERVAL '72 days'),
    ('student.ian.rogers@student.edu', 'Student', 'Ian', 'Rogers', 21, NOW() - INTERVAL '70 days'),
    ('student.julia.morgan@student.edu', 'Student', 'Julia', 'Morgan', 20, NOW() - INTERVAL '68 days'),
    ('student.kyle.peterson@student.edu', 'Student', 'Kyle', 'Peterson', 19, NOW() - INTERVAL '66 days'),
    ('student.lisa.cooper@student.edu', 'Student', 'Lisa', 'Cooper', 22, NOW() - INTERVAL '64 days'),
    ('student.mike.reed@student.edu', 'Student', 'Mike', 'Reed', 21, NOW() - INTERVAL '62 days'),
    ('student.nina.bailey@student.edu', 'Student', 'Nina', 'Bailey', 20, NOW() - INTERVAL '60 days'),
    ('student.oscar.bell@student.edu', 'Student', 'Oscar', 'Bell', 23, NOW() - INTERVAL '58 days'),
    ('student.paula.coleman@student.edu', 'Student', 'Paula', 'Coleman', 19, NOW() - INTERVAL '56 days'),
    ('student.quentin.jenkins@student.edu', 'Student', 'Quentin', 'Jenkins', 22, NOW() - INTERVAL '54 days'),
    ('student.rachel.perry@student.edu', 'Student', 'Rachel', 'Perry', 21, NOW() - INTERVAL '52 days'),
    ('student.simon.powell@student.edu', 'Student', 'Simon', 'Powell', 20, NOW() - INTERVAL '50 days'),
    ('student.tracy.long@student.edu', 'Student', 'Tracy', 'Long', 19, NOW() - INTERVAL '48 days'),
    ('student.umar.patterson@student.edu', 'Student', 'Umar', 'Patterson', 22, NOW() - INTERVAL '46 days'),
    ('student.vera.hughes@student.edu', 'Student', 'Vera', 'Hughes', 21, NOW() - INTERVAL '44 days'),
    ('student.wade.flores@student.edu', 'Student', 'Wade', 'Flores', 20, NOW() - INTERVAL '42 days'),
    ('student.xena.washington@student.edu', 'Student', 'Xena', 'Washington', 23, NOW() - INTERVAL '40 days'),
    ('student.yale.butler@student.edu', 'Student', 'Yale', 'Butler', 19, NOW() - INTERVAL '38 days'),
    ('student.zelda.simmons@student.edu', 'Student', 'Zelda', 'Simmons', 22, NOW() - INTERVAL '36 days'),
    ('student.adam.foster@student.edu', 'Student', 'Adam', 'Foster', 21, NOW() - INTERVAL '34 days'),
    ('student.beth.gonzales@student.edu', 'Student', 'Beth', 'Gonzales', 20, NOW() - INTERVAL '32 days'),
    ('student.chris.bryant@student.edu', 'Student', 'Chris', 'Bryant', 19, NOW() - INTERVAL '30 days'),
    ('student.donna.alexander@student.edu', 'Student', 'Donna', 'Alexander', 22, NOW() - INTERVAL '28 days'),
    ('student.eric.russell@student.edu', 'Student', 'Eric', 'Russell', 21, NOW() - INTERVAL '26 days'),
    ('student.faith.griffin@student.edu', 'Student', 'Faith', 'Griffin', 20, NOW() - INTERVAL '24 days'),
    ('student.gary.hayes@student.edu', 'Student', 'Gary', 'Hayes', 23, NOW() - INTERVAL '22 days'),
    ('student.heidi.wallace@student.edu', 'Student', 'Heidi', 'Wallace', 19, NOW() - INTERVAL '20 days'),
    ('student.isaac.wood@student.edu', 'Student', 'Isaac', 'Wood', 22, NOW() - INTERVAL '18 days'),
    ('student.jade.west@student.edu', 'Student', 'Jade', 'West', 21, NOW() - INTERVAL '16 days'),
    ('student.keith.cole@student.edu', 'Student', 'Keith', 'Cole', 20, NOW() - INTERVAL '14 days'),
    ('student.lily.wells@student.edu', 'Student', 'Lily', 'Wells', 19, NOW() - INTERVAL '12 days'),
    ('student.mason.sanders@student.edu', 'Student', 'Mason', 'Sanders', 22, NOW() - INTERVAL '10 days'),
    ('student.nora.price@student.edu', 'Student', 'Nora', 'Price', 21, NOW() - INTERVAL '8 days'),
    ('student.oliver.bennett@student.edu', 'Student', 'Oliver', 'Bennett', 20, NOW() - INTERVAL '6 days'),
    ('student.phoebe.barnes@student.edu', 'Student', 'Phoebe', 'Barnes', 23, NOW() - INTERVAL '4 days'),
    ('student.quinn.ross@student.edu', 'Student', 'Quinn', 'Ross', 19, NOW() - INTERVAL '2 days'),
    ('student.rose.henderson@student.edu', 'Student', 'Rose', 'Henderson', 22, NOW() - INTERVAL '1 day');
