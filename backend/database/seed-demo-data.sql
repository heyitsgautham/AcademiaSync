-- Demo Data Population Script for AcademiaSync
-- This script creates realistic data for demonstration purposes

-- Clear existing data (be careful in production!)
TRUNCATE TABLE refresh_tokens CASCADE;

TRUNCATE TABLE submissions CASCADE;

TRUNCATE TABLE assignments CASCADE;

TRUNCATE TABLE enrollments CASCADE;

TRUNCATE TABLE courses CASCADE;

TRUNCATE TABLE users CASCADE;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;

ALTER SEQUENCE courses_id_seq RESTART WITH 1;

ALTER SEQUENCE assignments_id_seq RESTART WITH 1;

ALTER SEQUENCE enrollments_id_seq RESTART WITH 1;

ALTER SEQUENCE submissions_id_seq RESTART WITH 1;

-- ========================================
-- DEMO USERS (Admin, Teacher, Student)
-- ========================================

-- Admin User (Demo Account)
INSERT INTO
    users (
        email,
        google_id,
        role,
        first_name,
        last_name,
        age,
        created_at
    )
VALUES (
        'heyitsgautham@gmail.com',
        'admin_gautham_123',
        'Admin',
        'Gautham',
        'Krishna',
        28,
        NOW() - INTERVAL '365 days'
    );

-- Additional Admins (9 more to make 10 total)
INSERT INTO
    users (
        email,
        role,
        first_name,
        last_name,
        age,
        created_at
    )
VALUES (
        'admin.sarah.wilson@academiasync.edu',
        'Admin',
        'Sarah',
        'Wilson',
        35,
        NOW() - INTERVAL '300 days'
    ),
    (
        'admin.michael.brown@academiasync.edu',
        'Admin',
        'Michael',
        'Brown',
        42,
        NOW() - INTERVAL '280 days'
    ),
    (
        'admin.emily.davis@academiasync.edu',
        'Admin',
        'Emily',
        'Davis',
        31,
        NOW() - INTERVAL '250 days'
    ),
    (
        'admin.james.taylor@academiasync.edu',
        'Admin',
        'James',
        'Taylor',
        38,
        NOW() - INTERVAL '220 days'
    ),
    (
        'admin.olivia.moore@academiasync.edu',
        'Admin',
        'Olivia',
        'Moore',
        29,
        NOW() - INTERVAL '200 days'
    ),
    (
        'admin.william.anderson@academiasync.edu',
        'Admin',
        'William',
        'Anderson',
        45,
        NOW() - INTERVAL '180 days'
    ),
    (
        'admin.sophia.thomas@academiasync.edu',
        'Admin',
        'Sophia',
        'Thomas',
        33,
        NOW() - INTERVAL '150 days'
    ),
    (
        'admin.benjamin.jackson@academiasync.edu',
        'Admin',
        'Benjamin',
        'Jackson',
        36,
        NOW() - INTERVAL '120 days'
    ),
    (
        'admin.ava.white@academiasync.edu',
        'Admin',
        'Ava',
        'White',
        30,
        NOW() - INTERVAL '90 days'
    );

-- Teacher User (Demo Account)
INSERT INTO
    users (
        email,
        google_id,
        role,
        first_name,
        last_name,
        age,
        specialization,
        created_at
    )
VALUES (
        'helloiamkishore@gmail.com',
        'teacher_kishore_456',
        'Teacher',
        'Kishore',
        'Kumar',
        32,
        'Computer Science',
        NOW() - INTERVAL '320 days'
    );

-- Additional Teachers (24 more to make 25 total)
INSERT INTO
    users (
        email,
        role,
        first_name,
        last_name,
        age,
        specialization,
        created_at
    )
VALUES (
        'teacher.robert.johnson@academiasync.edu',
        'Teacher',
        'Robert',
        'Johnson',
        45,
        'Mathematics',
        NOW() - INTERVAL '310 days'
    ),
    (
        'teacher.maria.garcia@academiasync.edu',
        'Teacher',
        'Maria',
        'Garcia',
        38,
        'Physics',
        NOW() - INTERVAL '300 days'
    ),
    (
        'teacher.david.martinez@academiasync.edu',
        'Teacher',
        'David',
        'Martinez',
        41,
        'Chemistry',
        NOW() - INTERVAL '290 days'
    ),
    (
        'teacher.jennifer.rodriguez@academiasync.edu',
        'Teacher',
        'Jennifer',
        'Rodriguez',
        36,
        'Biology',
        NOW() - INTERVAL '280 days'
    ),
    (
        'teacher.christopher.wilson@academiasync.edu',
        'Teacher',
        'Christopher',
        'Wilson',
        43,
        'Computer Science',
        NOW() - INTERVAL '270 days'
    ),
    (
        'teacher.linda.lopez@academiasync.edu',
        'Teacher',
        'Linda',
        'Lopez',
        39,
        'Data Science',
        NOW() - INTERVAL '260 days'
    ),
    (
        'teacher.daniel.gonzalez@academiasync.edu',
        'Teacher',
        'Daniel',
        'Gonzalez',
        37,
        'Artificial Intelligence',
        NOW() - INTERVAL '250 days'
    ),
    (
        'teacher.patricia.hernandez@academiasync.edu',
        'Teacher',
        'Patricia',
        'Hernandez',
        42,
        'Machine Learning',
        NOW() - INTERVAL '240 days'
    ),
    (
        'teacher.matthew.moore@academiasync.edu',
        'Teacher',
        'Matthew',
        'Moore',
        40,
        'Web Development',
        NOW() - INTERVAL '230 days'
    ),
    (
        'teacher.barbara.martin@academiasync.edu',
        'Teacher',
        'Barbara',
        'Martin',
        44,
        'Database Systems',
        NOW() - INTERVAL '220 days'
    ),
    (
        'teacher.joseph.jackson@academiasync.edu',
        'Teacher',
        'Joseph',
        'Jackson',
        35,
        'Cybersecurity',
        NOW() - INTERVAL '210 days'
    ),
    (
        'teacher.susan.lee@academiasync.edu',
        'Teacher',
        'Susan',
        'Lee',
        38,
        'Cloud Computing',
        NOW() - INTERVAL '200 days'
    ),
    (
        'teacher.thomas.perez@academiasync.edu',
        'Teacher',
        'Thomas',
        'Perez',
        46,
        'Software Engineering',
        NOW() - INTERVAL '190 days'
    ),
    (
        'teacher.karen.thompson@academiasync.edu',
        'Teacher',
        'Karen',
        'Thompson',
        34,
        'Mobile Development',
        NOW() - INTERVAL '180 days'
    ),
    (
        'teacher.charles.white@academiasync.edu',
        'Teacher',
        'Charles',
        'White',
        41,
        'DevOps',
        NOW() - INTERVAL '170 days'
    ),
    (
        'teacher.nancy.harris@academiasync.edu',
        'Teacher',
        'Nancy',
        'Harris',
        37,
        'UI/UX Design',
        NOW() - INTERVAL '160 days'
    ),
    (
        'teacher.paul.sanchez@academiasync.edu',
        'Teacher',
        'Paul',
        'Sanchez',
        39,
        'Blockchain',
        NOW() - INTERVAL '150 days'
    ),
    (
        'teacher.betty.clark@academiasync.edu',
        'Teacher',
        'Betty',
        'Clark',
        43,
        'IoT',
        NOW() - INTERVAL '140 days'
    ),
    (
        'teacher.mark.ramirez@academiasync.edu',
        'Teacher',
        'Mark',
        'Ramirez',
        36,
        'Game Development',
        NOW() - INTERVAL '130 days'
    ),
    (
        'teacher.helen.lewis@academiasync.edu',
        'Teacher',
        'Helen',
        'Lewis',
        40,
        'Computer Networks',
        NOW() - INTERVAL '120 days'
    ),
    (
        'teacher.donald.robinson@academiasync.edu',
        'Teacher',
        'Donald',
        'Robinson',
        45,
        'Operating Systems',
        NOW() - INTERVAL '110 days'
    ),
    (
        'teacher.michelle.walker@academiasync.edu',
        'Teacher',
        'Michelle',
        'Walker',
        33,
        'Computer Graphics',
        NOW() - INTERVAL '100 days'
    ),
    (
        'teacher.kenneth.young@academiasync.edu',
        'Teacher',
        'Kenneth',
        'Young',
        42,
        'Natural Language Processing',
        NOW() - INTERVAL '90 days'
    ),
    (
        'teacher.laura.allen@academiasync.edu',
        'Teacher',
        'Laura',
        'Allen',
        35,
        'Computer Vision',
        NOW() - INTERVAL '80 days'
    ),
    (
        'teacher.steven.king@academiasync.edu',
        'Teacher',
        'Steven',
        'King',
        44,
        'Robotics',
        NOW() - INTERVAL '70 days'
    );

-- Student User (Demo Account)
INSERT INTO
    users (
        email,
        google_id,
        role,
        first_name,
        last_name,
        age,
        created_at
    )
VALUES (
        'xmyhiruthik2020@gmail.com',
        'student_hiruthik_789',
        'Student',
        'Hiruthik',
        'M',
        22,
        NOW() - INTERVAL '200 days'
    );

-- Additional Students (99 more to make 100 total)
INSERT INTO
    users (
        email,
        role,
        first_name,
        last_name,
        age,
        created_at
    )
VALUES (
        'student.alice.brown@student.edu',
        'Student',
        'Alice',
        'Brown',
        20,
        NOW() - INTERVAL '190 days'
    ),
    (
        'student.bob.williams@student.edu',
        'Student',
        'Bob',
        'Williams',
        21,
        NOW() - INTERVAL '188 days'
    ),
    (
        'student.carol.jones@student.edu',
        'Student',
        'Carol',
        'Jones',
        19,
        NOW() - INTERVAL '186 days'
    ),
    (
        'student.dave.miller@student.edu',
        'Student',
        'Dave',
        'Miller',
        22,
        NOW() - INTERVAL '184 days'
    ),
    (
        'student.eve.davis@student.edu',
        'Student',
        'Eve',
        'Davis',
        20,
        NOW() - INTERVAL '182 days'
    ),
    (
        'student.frank.garcia@student.edu',
        'Student',
        'Frank',
        'Garcia',
        23,
        NOW() - INTERVAL '180 days'
    ),
    (
        'student.grace.martinez@student.edu',
        'Student',
        'Grace',
        'Martinez',
        21,
        NOW() - INTERVAL '178 days'
    ),
    (
        'student.henry.rodriguez@student.edu',
        'Student',
        'Henry',
        'Rodriguez',
        20,
        NOW() - INTERVAL '176 days'
    ),
    (
        'student.ivy.wilson@student.edu',
        'Student',
        'Ivy',
        'Wilson',
        19,
        NOW() - INTERVAL '174 days'
    ),
    (
        'student.jack.lopez@student.edu',
        'Student',
        'Jack',
        'Lopez',
        22,
        NOW() - INTERVAL '172 days'
    ),
    (
        'student.kate.gonzalez@student.edu',
        'Student',
        'Kate',
        'Gonzalez',
        21,
        NOW() - INTERVAL '170 days'
    ),
    (
        'student.leo.hernandez@student.edu',
        'Student',
        'Leo',
        'Hernandez',
        20,
        NOW() - INTERVAL '168 days'
    ),
    (
        'student.mia.moore@student.edu',
        'Student',
        'Mia',
        'Moore',
        23,
        NOW() - INTERVAL '166 days'
    ),
    (
        'student.noah.martin@student.edu',
        'Student',
        'Noah',
        'Martin',
        19,
        NOW() - INTERVAL '164 days'
    ),
    (
        'student.olivia.jackson@student.edu',
        'Student',
        'Olivia',
        'Jackson',
        22,
        NOW() - INTERVAL '162 days'
    ),
    (
        'student.peter.lee@student.edu',
        'Student',
        'Peter',
        'Lee',
        21,
        NOW() - INTERVAL '160 days'
    ),
    (
        'student.quinn.perez@student.edu',
        'Student',
        'Quinn',
        'Perez',
        20,
        NOW() - INTERVAL '158 days'
    ),
    (
        'student.ryan.thompson@student.edu',
        'Student',
        'Ryan',
        'Thompson',
        19,
        NOW() - INTERVAL '156 days'
    ),
    (
        'student.sarah.white@student.edu',
        'Student',
        'Sarah',
        'White',
        22,
        NOW() - INTERVAL '154 days'
    ),
    (
        'student.tom.harris@student.edu',
        'Student',
        'Tom',
        'Harris',
        21,
        NOW() - INTERVAL '152 days'
    ),
    (
        'student.uma.sanchez@student.edu',
        'Student',
        'Uma',
        'Sanchez',
        20,
        NOW() - INTERVAL '150 days'
    ),
    (
        'student.victor.clark@student.edu',
        'Student',
        'Victor',
        'Clark',
        23,
        NOW() - INTERVAL '148 days'
    ),
    (
        'student.wendy.ramirez@student.edu',
        'Student',
        'Wendy',
        'Ramirez',
        19,
        NOW() - INTERVAL '146 days'
    ),
    (
        'student.xavier.lewis@student.edu',
        'Student',
        'Xavier',
        'Lewis',
        22,
        NOW() - INTERVAL '144 days'
    ),
    (
        'student.yara.robinson@student.edu',
        'Student',
        'Yara',
        'Robinson',
        21,
        NOW() - INTERVAL '142 days'
    ),
    (
        'student.zack.walker@student.edu',
        'Student',
        'Zack',
        'Walker',
        20,
        NOW() - INTERVAL '140 days'
    ),
    (
        'student.amy.young@student.edu',
        'Student',
        'Amy',
        'Young',
        19,
        NOW() - INTERVAL '138 days'
    ),
    (
        'student.brian.allen@student.edu',
        'Student',
        'Brian',
        'Allen',
        22,
        NOW() - INTERVAL '136 days'
    ),
    (
        'student.cathy.king@student.edu',
        'Student',
        'Cathy',
        'King',
        21,
        NOW() - INTERVAL '134 days'
    ),
    (
        'student.derek.wright@student.edu',
        'Student',
        'Derek',
        'Wright',
        20,
        NOW() - INTERVAL '132 days'
    ),
    (
        'student.emma.scott@student.edu',
        'Student',
        'Emma',
        'Scott',
        23,
        NOW() - INTERVAL '130 days'
    ),
    (
        'student.felix.torres@student.edu',
        'Student',
        'Felix',
        'Torres',
        19,
        NOW() - INTERVAL '128 days'
    ),
    (
        'student.gina.nguyen@student.edu',
        'Student',
        'Gina',
        'Nguyen',
        22,
        NOW() - INTERVAL '126 days'
    ),
    (
        'student.hugo.hill@student.edu',
        'Student',
        'Hugo',
        'Hill',
        21,
        NOW() - INTERVAL '124 days'
    ),
    (
        'student.iris.flores@student.edu',
        'Student',
        'Iris',
        'Flores',
        20,
        NOW() - INTERVAL '122 days'
    ),
    (
        'student.jason.green@student.edu',
        'Student',
        'Jason',
        'Green',
        19,
        NOW() - INTERVAL '120 days'
    ),
    (
        'student.kelly.adams@student.edu',
        'Student',
        'Kelly',
        'Adams',
        22,
        NOW() - INTERVAL '118 days'
    ),
    (
        'student.luke.nelson@student.edu',
        'Student',
        'Luke',
        'Nelson',
        21,
        NOW() - INTERVAL '116 days'
    ),
    (
        'student.maya.baker@student.edu',
        'Student',
        'Maya',
        'Baker',
        20,
        NOW() - INTERVAL '114 days'
    ),
    (
        'student.nick.hall@student.edu',
        'Student',
        'Nick',
        'Hall',
        23,
        NOW() - INTERVAL '112 days'
    ),
    (
        'student.owen.rivera@student.edu',
        'Student',
        'Owen',
        'Rivera',
        19,
        NOW() - INTERVAL '110 days'
    ),
    (
        'student.penny.campbell@student.edu',
        'Student',
        'Penny',
        'Campbell',
        22,
        NOW() - INTERVAL '108 days'
    ),
    (
        'student.quincy.mitchell@student.edu',
        'Student',
        'Quincy',
        'Mitchell',
        21,
        NOW() - INTERVAL '106 days'
    ),
    (
        'student.ruby.carter@student.edu',
        'Student',
        'Ruby',
        'Carter',
        20,
        NOW() - INTERVAL '104 days'
    ),
    (
        'student.sam.roberts@student.edu',
        'Student',
        'Sam',
        'Roberts',
        19,
        NOW() - INTERVAL '102 days'
    ),
    (
        'student.tina.gomez@student.edu',
        'Student',
        'Tina',
        'Gomez',
        22,
        NOW() - INTERVAL '100 days'
    ),
    (
        'student.ursula.phillips@student.edu',
        'Student',
        'Ursula',
        'Phillips',
        21,
        NOW() - INTERVAL '98 days'
    ),
    (
        'student.vince.evans@student.edu',
        'Student',
        'Vince',
        'Evans',
        20,
        NOW() - INTERVAL '96 days'
    ),
    (
        'student.wanda.turner@student.edu',
        'Student',
        'Wanda',
        'Turner',
        23,
        NOW() - INTERVAL '94 days'
    ),
    (
        'student.xander.diaz@student.edu',
        'Student',
        'Xander',
        'Diaz',
        19,
        NOW() - INTERVAL '92 days'
    ),
    (
        'student.yasmin.parker@student.edu',
        'Student',
        'Yasmin',
        'Parker',
        22,
        NOW() - INTERVAL '90 days'
    ),
    (
        'student.zoe.cruz@student.edu',
        'Student',
        'Zoe',
        'Cruz',
        21,
        NOW() - INTERVAL '88 days'
    ),
    (
        'student.aaron.edwards@student.edu',
        'Student',
        'Aaron',
        'Edwards',
        20,
        NOW() - INTERVAL '86 days'
    ),
    (
        'student.bella.collins@student.edu',
        'Student',
        'Bella',
        'Collins',
        19,
        NOW() - INTERVAL '84 days'
    ),
    (
        'student.carl.reyes@student.edu',
        'Student',
        'Carl',
        'Reyes',
        22,
        NOW() - INTERVAL '82 days'
    ),
    (
        'student.diana.stewart@student.edu',
        'Student',
        'Diana',
        'Stewart',
        21,
        NOW() - INTERVAL '80 days'
    ),
    (
        'student.ethan.morris@student.edu',
        'Student',
        'Ethan',
        'Morris',
        20,
        NOW() - INTERVAL '78 days'
    ),
    (
        'student.fiona.morales@student.edu',
        'Student',
        'Fiona',
        'Morales',
        23,
        NOW() - INTERVAL '76 days'
    ),
    (
        'student.george.murphy@student.edu',
        'Student',
        'George',
        'Murphy',
        19,
        NOW() - INTERVAL '74 days'
    ),
    (
        'student.hannah.cook@student.edu',
        'Student',
        'Hannah',
        'Cook',
        22,
        NOW() - INTERVAL '72 days'
    ),
    (
        'student.ian.rogers@student.edu',
        'Student',
        'Ian',
        'Rogers',
        21,
        NOW() - INTERVAL '70 days'
    ),
    (
        'student.julia.morgan@student.edu',
        'Student',
        'Julia',
        'Morgan',
        20,
        NOW() - INTERVAL '68 days'
    ),
    (
        'student.kyle.peterson@student.edu',
        'Student',
        'Kyle',
        'Peterson',
        19,
        NOW() - INTERVAL '66 days'
    ),
    (
        'student.lisa.cooper@student.edu',
        'Student',
        'Lisa',
        'Cooper',
        22,
        NOW() - INTERVAL '64 days'
    ),
    (
        'student.mike.reed@student.edu',
        'Student',
        'Mike',
        'Reed',
        21,
        NOW() - INTERVAL '62 days'
    ),
    (
        'student.nina.bailey@student.edu',
        'Student',
        'Nina',
        'Bailey',
        20,
        NOW() - INTERVAL '60 days'
    ),
    (
        'student.oscar.bell@student.edu',
        'Student',
        'Oscar',
        'Bell',
        23,
        NOW() - INTERVAL '58 days'
    ),
    (
        'student.paula.coleman@student.edu',
        'Student',
        'Paula',
        'Coleman',
        19,
        NOW() - INTERVAL '56 days'
    ),
    (
        'student.quentin.jenkins@student.edu',
        'Student',
        'Quentin',
        'Jenkins',
        22,
        NOW() - INTERVAL '54 days'
    ),
    (
        'student.rachel.perry@student.edu',
        'Student',
        'Rachel',
        'Perry',
        21,
        NOW() - INTERVAL '52 days'
    ),
    (
        'student.simon.powell@student.edu',
        'Student',
        'Simon',
        'Powell',
        20,
        NOW() - INTERVAL '50 days'
    ),
    (
        'student.tracy.long@student.edu',
        'Student',
        'Tracy',
        'Long',
        19,
        NOW() - INTERVAL '48 days'
    ),
    (
        'student.umar.patterson@student.edu',
        'Student',
        'Umar',
        'Patterson',
        22,
        NOW() - INTERVAL '46 days'
    ),
    (
        'student.vera.hughes@student.edu',
        'Student',
        'Vera',
        'Hughes',
        21,
        NOW() - INTERVAL '44 days'
    ),
    (
        'student.wade.flores@student.edu',
        'Student',
        'Wade',
        'Flores',
        20,
        NOW() - INTERVAL '42 days'
    ),
    (
        'student.xena.washington@student.edu',
        'Student',
        'Xena',
        'Washington',
        23,
        NOW() - INTERVAL '40 days'
    ),
    (
        'student.yale.butler@student.edu',
        'Student',
        'Yale',
        'Butler',
        19,
        NOW() - INTERVAL '38 days'
    ),
    (
        'student.zelda.simmons@student.edu',
        'Student',
        'Zelda',
        'Simmons',
        22,
        NOW() - INTERVAL '36 days'
    ),
    (
        'student.adam.foster@student.edu',
        'Student',
        'Adam',
        'Foster',
        21,
        NOW() - INTERVAL '34 days'
    ),
    (
        'student.beth.gonzales@student.edu',
        'Student',
        'Beth',
        'Gonzales',
        20,
        NOW() - INTERVAL '32 days'
    ),
    (
        'student.chris.bryant@student.edu',
        'Student',
        'Chris',
        'Bryant',
        19,
        NOW() - INTERVAL '30 days'
    ),
    (
        'student.donna.alexander@student.edu',
        'Student',
        'Donna',
        'Alexander',
        22,
        NOW() - INTERVAL '28 days'
    ),
    (
        'student.eric.russell@student.edu',
        'Student',
        'Eric',
        'Russell',
        21,
        NOW() - INTERVAL '26 days'
    ),
    (
        'student.faith.griffin@student.edu',
        'Student',
        'Faith',
        'Griffin',
        20,
        NOW() - INTERVAL '24 days'
    ),
    (
        'student.gary.hayes@student.edu',
        'Student',
        'Gary',
        'Hayes',
        23,
        NOW() - INTERVAL '22 days'
    ),
    (
        'student.heidi.wallace@student.edu',
        'Student',
        'Heidi',
        'Wallace',
        19,
        NOW() - INTERVAL '20 days'
    ),
    (
        'student.isaac.wood@student.edu',
        'Student',
        'Isaac',
        'Wood',
        22,
        NOW() - INTERVAL '18 days'
    ),
    (
        'student.jade.west@student.edu',
        'Student',
        'Jade',
        'West',
        21,
        NOW() - INTERVAL '16 days'
    ),
    (
        'student.keith.cole@student.edu',
        'Student',
        'Keith',
        'Cole',
        20,
        NOW() - INTERVAL '14 days'
    ),
    (
        'student.lily.wells@student.edu',
        'Student',
        'Lily',
        'Wells',
        19,
        NOW() - INTERVAL '12 days'
    ),
    (
        'student.mason.sanders@student.edu',
        'Student',
        'Mason',
        'Sanders',
        22,
        NOW() - INTERVAL '10 days'
    ),
    (
        'student.nora.price@student.edu',
        'Student',
        'Nora',
        'Price',
        21,
        NOW() - INTERVAL '8 days'
    ),
    (
        'student.oliver.bennett@student.edu',
        'Student',
        'Oliver',
        'Bennett',
        20,
        NOW() - INTERVAL '6 days'
    ),
    (
        'student.phoebe.barnes@student.edu',
        'Student',
        'Phoebe',
        'Barnes',
        23,
        NOW() - INTERVAL '4 days'
    ),
    (
        'student.quinn.ross@student.edu',
        'Student',
        'Quinn',
        'Ross',
        19,
        NOW() - INTERVAL '2 days'
    ),
    (
        'student.rose.henderson@student.edu',
        'Student',
        'Rose',
        'Henderson',
        22,
        NOW() - INTERVAL '1 day'
    );

-- ========================================
-- COURSES (75 courses across 25 teachers)
-- ========================================

-- Each teacher gets 3 courses on average
INSERT INTO
    courses (
        title,
        description,
        teacher_id,
        weeks,
        created_at
    )
VALUES
    -- Teacher 11 (Kishore - Demo Account) - Computer Science
    (
        'Introduction to Programming',
        'Learn the fundamentals of programming using Python',
        11,
        12,
        NOW() - INTERVAL '280 days'
    ),
    (
        'Data Structures and Algorithms',
        'Master essential data structures and algorithmic techniques',
        11,
        16,
        NOW() - INTERVAL '250 days'
    ),
    (
        'Advanced Database Systems',
        'Deep dive into database design, optimization, and management',
        11,
        14,
        NOW() - INTERVAL '220 days'
    ),

-- Teacher 12 - Mathematics
(
    'Calculus I',
    'Introduction to differential and integral calculus',
    12,
    15,
    NOW() - INTERVAL '270 days'
),
(
    'Linear Algebra',
    'Study of vector spaces, matrices, and linear transformations',
    12,
    12,
    NOW() - INTERVAL '240 days'
),
(
    'Discrete Mathematics',
    'Mathematical structures and logic for computer science',
    12,
    14,
    NOW() - INTERVAL '210 days'
),

-- Teacher 13 - Physics
(
    'Classical Mechanics',
    'Fundamental principles of motion and forces',
    13,
    16,
    NOW() - INTERVAL '260 days'
),
(
    'Quantum Physics',
    'Introduction to quantum mechanics and its applications',
    13,
    18,
    NOW() - INTERVAL '230 days'
),
(
    'Electromagnetism',
    'Study of electric and magnetic fields',
    13,
    14,
    NOW() - INTERVAL '200 days'
),

-- Teacher 14 - Chemistry
(
    'Organic Chemistry',
    'Study of carbon-based compounds and reactions',
    14,
    16,
    NOW() - INTERVAL '250 days'
),
(
    'Physical Chemistry',
    'Chemical thermodynamics and kinetics',
    14,
    14,
    NOW() - INTERVAL '220 days'
),
(
    'Analytical Chemistry',
    'Methods for analyzing chemical composition',
    14,
    12,
    NOW() - INTERVAL '190 days'
),

-- Teacher 15 - Biology
(
    'Molecular Biology',
    'Study of biological processes at molecular level',
    15,
    15,
    NOW() - INTERVAL '240 days'
),
(
    'Genetics and Evolution',
    'Principles of heredity and evolutionary biology',
    15,
    16,
    NOW() - INTERVAL '210 days'
),
(
    'Cell Biology',
    'Structure and function of cells',
    15,
    12,
    NOW() - INTERVAL '180 days'
),

-- Teacher 16 - Computer Science
(
    'Object-Oriented Programming',
    'Learn OOP concepts with Java',
    16,
    14,
    NOW() - INTERVAL '230 days'
),
(
    'Software Design Patterns',
    'Common design patterns in software engineering',
    16,
    12,
    NOW() - INTERVAL '200 days'
),
(
    'System Design',
    'Designing scalable distributed systems',
    16,
    16,
    NOW() - INTERVAL '170 days'
),

-- Teacher 17 - Data Science
(
    'Introduction to Data Science',
    'Fundamentals of data analysis and visualization',
    17,
    14,
    NOW() - INTERVAL '220 days'
),
(
    'Statistical Learning',
    'Statistical methods for predictive modeling',
    17,
    16,
    NOW() - INTERVAL '190 days'
),
(
    'Big Data Analytics',
    'Processing and analyzing large-scale datasets',
    17,
    18,
    NOW() - INTERVAL '160 days'
),

-- Teacher 18 - Artificial Intelligence
(
    'Introduction to AI',
    'Foundations of artificial intelligence',
    18,
    15,
    NOW() - INTERVAL '210 days'
),
(
    'Deep Learning',
    'Neural networks and deep learning architectures',
    18,
    18,
    NOW() - INTERVAL '180 days'
),
(
    'Reinforcement Learning',
    'Learning through interaction and rewards',
    18,
    16,
    NOW() - INTERVAL '150 days'
),

-- Teacher 19 - Machine Learning
(
    'Machine Learning Fundamentals',
    'Core concepts of machine learning',
    19,
    16,
    NOW() - INTERVAL '200 days'
),
(
    'Advanced ML Algorithms',
    'Ensemble methods and advanced techniques',
    19,
    14,
    NOW() - INTERVAL '170 days'
),
(
    'ML in Production',
    'Deploying and maintaining ML systems',
    19,
    12,
    NOW() - INTERVAL '140 days'
),

-- Teacher 20 - Web Development
(
    'Frontend Web Development',
    'HTML, CSS, and JavaScript fundamentals',
    20,
    12,
    NOW() - INTERVAL '190 days'
),
(
    'React and Modern Frameworks',
    'Building applications with React',
    20,
    14,
    NOW() - INTERVAL '160 days'
),
(
    'Full-Stack Development',
    'End-to-end web application development',
    20,
    18,
    NOW() - INTERVAL '130 days'
),

-- Teacher 21 - Database Systems
(
    'Database Design',
    'Principles of relational database design',
    21,
    14,
    NOW() - INTERVAL '180 days'
),
(
    'NoSQL Databases',
    'MongoDB, Redis, and other NoSQL solutions',
    21,
    12,
    NOW() - INTERVAL '150 days'
),
(
    'Database Performance Tuning',
    'Optimizing database queries and indexes',
    21,
    16,
    NOW() - INTERVAL '120 days'
),

-- Teacher 22 - Cybersecurity
(
    'Network Security',
    'Securing computer networks and communications',
    22,
    15,
    NOW() - INTERVAL '170 days'
),
(
    'Ethical Hacking',
    'Penetration testing and security assessment',
    22,
    16,
    NOW() - INTERVAL '140 days'
),
(
    'Cryptography',
    'Encryption algorithms and security protocols',
    22,
    14,
    NOW() - INTERVAL '110 days'
),

-- Teacher 23 - Cloud Computing
(
    'Cloud Infrastructure',
    'AWS, Azure, and cloud fundamentals',
    23,
    14,
    NOW() - INTERVAL '160 days'
),
(
    'Serverless Architecture',
    'Building serverless applications',
    23,
    12,
    NOW() - INTERVAL '130 days'
),
(
    'Cloud Security',
    'Securing cloud-based applications',
    23,
    16,
    NOW() - INTERVAL '100 days'
),

-- Teacher 24 - Software Engineering
(
    'Software Requirements Engineering',
    'Gathering and analyzing requirements',
    24,
    12,
    NOW() - INTERVAL '150 days'
),
(
    'Agile Development',
    'Scrum, Kanban, and agile methodologies',
    24,
    14,
    NOW() - INTERVAL '120 days'
),
(
    'Software Testing',
    'Testing strategies and quality assurance',
    24,
    16,
    NOW() - INTERVAL '90 days'
),

-- Teacher 25 - Mobile Development
(
    'iOS Development',
    'Building apps for iPhone and iPad',
    25,
    16,
    NOW() - INTERVAL '140 days'
),
(
    'Android Development',
    'Creating Android applications',
    25,
    16,
    NOW() - INTERVAL '110 days'
),
(
    'Cross-Platform Development',
    'React Native and Flutter',
    25,
    14,
    NOW() - INTERVAL '80 days'
),

-- Teacher 26 - DevOps
(
    'CI/CD Pipelines',
    'Continuous integration and deployment',
    26,
    12,
    NOW() - INTERVAL '130 days'
),
(
    'Container Orchestration',
    'Kubernetes and Docker Swarm',
    26,
    14,
    NOW() - INTERVAL '100 days'
),
(
    'Infrastructure as Code',
    'Terraform and CloudFormation',
    26,
    16,
    NOW() - INTERVAL '70 days'
),

-- Teacher 27 - UI/UX Design
(
    'User Experience Design',
    'Principles of UX design',
    27,
    12,
    NOW() - INTERVAL '120 days'
),
(
    'UI Design Fundamentals',
    'Creating beautiful user interfaces',
    27,
    14,
    NOW() - INTERVAL '90 days'
),
(
    'Design Systems',
    'Building scalable design systems',
    27,
    16,
    NOW() - INTERVAL '60 days'
),

-- Teacher 28 - Blockchain
(
    'Blockchain Fundamentals',
    'Understanding blockchain technology',
    28,
    14,
    NOW() - INTERVAL '110 days'
),
(
    'Smart Contracts',
    'Developing smart contracts with Solidity',
    28,
    16,
    NOW() - INTERVAL '80 days'
),
(
    'Decentralized Applications',
    'Building dApps on Ethereum',
    28,
    18,
    NOW() - INTERVAL '50 days'
),

-- Teacher 29 - IoT
(
    'Internet of Things Basics',
    'Introduction to IoT systems',
    29,
    12,
    NOW() - INTERVAL '100 days'
),
(
    'IoT Security',
    'Securing IoT devices and networks',
    29,
    14,
    NOW() - INTERVAL '70 days'
),
(
    'Industrial IoT',
    'IoT in manufacturing and industry',
    29,
    16,
    NOW() - INTERVAL '40 days'
),

-- Teacher 30 - Game Development
(
    'Game Design Principles',
    'Fundamentals of game design',
    30,
    14,
    NOW() - INTERVAL '90 days'
),
(
    'Unity Game Development',
    'Creating games with Unity engine',
    30,
    16,
    NOW() - INTERVAL '60 days'
),
(
    '3D Graphics Programming',
    'OpenGL and 3D rendering',
    30,
    18,
    NOW() - INTERVAL '30 days'
),

-- Teacher 31 - Computer Networks
(
    'Computer Networks',
    'TCP/IP and network protocols',
    31,
    15,
    NOW() - INTERVAL '80 days'
),
(
    'Network Programming',
    'Socket programming and APIs',
    31,
    14,
    NOW() - INTERVAL '50 days'
),
(
    'Wireless Networks',
    'WiFi, 5G, and wireless technologies',
    31,
    12,
    NOW() - INTERVAL '20 days'
),

-- Teacher 32 - Operating Systems
(
    'Operating Systems',
    'OS concepts and design',
    32,
    16,
    NOW() - INTERVAL '70 days'
),
(
    'Linux System Administration',
    'Managing Linux servers',
    32,
    14,
    NOW() - INTERVAL '40 days'
),
(
    'Distributed Systems',
    'Building distributed applications',
    32,
    18,
    NOW() - INTERVAL '10 days'
),

-- Teacher 33 - Computer Graphics
(
    'Computer Graphics',
    'Rendering and visualization techniques',
    33,
    16,
    NOW() - INTERVAL '60 days'
),
(
    'Advanced Rendering',
    'Ray tracing and global illumination',
    33,
    18,
    NOW() - INTERVAL '30 days'
),
(
    'Animation and Simulation',
    'Character animation and physics',
    33,
    14,
    NOW() - INTERVAL '5 days'
),

-- Teacher 34 - Natural Language Processing
(
    'Introduction to NLP',
    'Text processing and analysis',
    34,
    15,
    NOW() - INTERVAL '50 days'
),
(
    'Advanced NLP',
    'Transformers and language models',
    34,
    18,
    NOW() - INTERVAL '20 days'
),
(
    'Conversational AI',
    'Building chatbots and assistants',
    34,
    16,
    NOW() - INTERVAL '3 days'
),

-- Teacher 35 - Computer Vision
(
    'Computer Vision Basics',
    'Image processing fundamentals',
    35,
    14,
    NOW() - INTERVAL '40 days'
),
(
    'Object Detection and Recognition',
    'CNN-based detection systems',
    35,
    16,
    NOW() - INTERVAL '10 days'
),
(
    'Video Analysis',
    'Processing and analyzing video data',
    35,
    18,
    NOW() - INTERVAL '1 day'
);

-- ========================================
-- ENROLLMENTS (Students enrolled in courses)
-- ========================================

-- Demo student (ID 36) enrolls in multiple courses
INSERT INTO
    enrollments (
        student_id,
        course_id,
        enrolled_at
    )
VALUES (
        36,
        1,
        NOW() - INTERVAL '250 days'
    ), -- Intro to Programming (Demo Teacher's Course)
    (
        36,
        2,
        NOW() - INTERVAL '220 days'
    ), -- Data Structures (Demo Teacher's Course)
    (
        36,
        3,
        NOW() - INTERVAL '200 days'
    ), -- Database Systems (Demo Teacher's Course)
    (
        36,
        12,
        NOW() - INTERVAL '180 days'
    ), -- Analytical Chemistry
    (
        36,
        13,
        NOW() - INTERVAL '160 days'
    ), -- Molecular Biology
    (
        36,
        49,
        NOW() - INTERVAL '140 days'
    ), -- User Experience Design
    (
        36,
        50,
        NOW() - INTERVAL '120 days'
    ), -- UI Design Fundamentals
    (
        36,
        51,
        NOW() - INTERVAL '100 days'
    );
-- Design Systems

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
        WHERE role = 'Student' AND id != 36
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