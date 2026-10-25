-- ========================================
-- COURSES (75 courses across 25 teachers)
-- ========================================

-- Each teacher gets 3 courses on average
INSERT INTO
    courses (title, description, teacher_id, weeks, created_at)
VALUES
    -- Teacher 11 (Kishore - Demo Account) - Computer Science
    ('Introduction to Programming', 'Learn the fundamentals of programming using Python', 11, 12, NOW() - INTERVAL '280 days'),
    ('Data Structures and Algorithms', 'Master essential data structures and algorithmic techniques', 11, 16, NOW() - INTERVAL '250 days'),
    ('Advanced Database Systems', 'Deep dive into database design, optimization, and management', 11, 14, NOW() - INTERVAL '220 days'),

-- Teacher 12 - Mathematics
('Calculus I', 'Introduction to differential and integral calculus', 12, 15, NOW() - INTERVAL '270 days'),
('Linear Algebra', 'Study of vector spaces, matrices, and linear transformations', 12, 12, NOW() - INTERVAL '240 days'),
('Discrete Mathematics', 'Mathematical structures and logic for computer science', 12, 14, NOW() - INTERVAL '210 days'),

-- Teacher 13 - Physics
('Classical Mechanics', 'Fundamental principles of motion and forces', 13, 16, NOW() - INTERVAL '260 days'),
('Quantum Physics', 'Introduction to quantum mechanics and its applications', 13, 18, NOW() - INTERVAL '230 days'),
('Electromagnetism', 'Study of electric and magnetic fields', 13, 14, NOW() - INTERVAL '200 days'),

-- Teacher 14 - Chemistry
('Organic Chemistry', 'Study of carbon-based compounds and reactions', 14, 16, NOW() - INTERVAL '250 days'),
('Physical Chemistry', 'Chemical thermodynamics and kinetics', 14, 14, NOW() - INTERVAL '220 days'),
('Analytical Chemistry', 'Methods for analyzing chemical composition', 14, 12, NOW() - INTERVAL '190 days'),

-- Teacher 15 - Biology
('Molecular Biology', 'Study of biological processes at molecular level', 15, 15, NOW() - INTERVAL '240 days'),
('Genetics and Evolution', 'Principles of heredity and evolutionary biology', 15, 16, NOW() - INTERVAL '210 days'),
('Cell Biology', 'Structure and function of cells', 15, 12, NOW() - INTERVAL '180 days'),

-- Teacher 16 - Computer Science
('Object-Oriented Programming', 'Learn OOP concepts with Java', 16, 14, NOW() - INTERVAL '230 days'),
('Software Design Patterns', 'Common design patterns in software engineering', 16, 12, NOW() - INTERVAL '200 days'),
('System Design', 'Designing scalable distributed systems', 16, 16, NOW() - INTERVAL '170 days'),

-- Teacher 17 - Data Science
('Introduction to Data Science', 'Fundamentals of data analysis and visualization', 17, 14, NOW() - INTERVAL '220 days'),
('Statistical Learning', 'Statistical methods for predictive modeling', 17, 16, NOW() - INTERVAL '190 days'),
('Big Data Analytics', 'Processing and analyzing large-scale datasets', 17, 18, NOW() - INTERVAL '160 days'),

-- Teacher 18 - Artificial Intelligence
('Introduction to AI', 'Foundations of artificial intelligence', 18, 15, NOW() - INTERVAL '210 days'),
('Deep Learning', 'Neural networks and deep learning architectures', 18, 18, NOW() - INTERVAL '180 days'),
('Reinforcement Learning', 'Learning through interaction and rewards', 18, 16, NOW() - INTERVAL '150 days'),

-- Teacher 19 - Machine Learning
('Machine Learning Fundamentals', 'Core concepts of machine learning', 19, 16, NOW() - INTERVAL '200 days'),
('Advanced ML Algorithms', 'Ensemble methods and advanced techniques', 19, 14, NOW() - INTERVAL '170 days'),
('ML in Production', 'Deploying and maintaining ML systems', 19, 12, NOW() - INTERVAL '140 days'),

-- Teacher 20 - Web Development
('Frontend Web Development', 'HTML, CSS, and JavaScript fundamentals', 20, 12, NOW() - INTERVAL '190 days'),
('React and Modern Frameworks', 'Building applications with React', 20, 14, NOW() - INTERVAL '160 days'),
('Full-Stack Development', 'End-to-end web application development', 20, 18, NOW() - INTERVAL '130 days'),

-- Teacher 21 - Database Systems
('Database Design', 'Principles of relational database design', 21, 14, NOW() - INTERVAL '180 days'),
('NoSQL Databases', 'MongoDB, Redis, and other NoSQL solutions', 21, 12, NOW() - INTERVAL '150 days'),
('Database Performance Tuning', 'Optimizing database queries and indexes', 21, 16, NOW() - INTERVAL '120 days'),

-- Teacher 22 - Cybersecurity
('Network Security', 'Securing computer networks and communications', 22, 15, NOW() - INTERVAL '170 days'),
('Ethical Hacking', 'Penetration testing and security assessment', 22, 16, NOW() - INTERVAL '140 days'),
('Cryptography', 'Encryption algorithms and security protocols', 22, 14, NOW() - INTERVAL '110 days'),

-- Teacher 23 - Cloud Computing
('Cloud Infrastructure', 'AWS, Azure, and cloud fundamentals', 23, 14, NOW() - INTERVAL '160 days'),
('Serverless Architecture', 'Building serverless applications', 23, 12, NOW() - INTERVAL '130 days'),
('Cloud Security', 'Securing cloud-based applications', 23, 16, NOW() - INTERVAL '100 days'),

-- Teacher 24 - Software Engineering
('Software Requirements Engineering', 'Gathering and analyzing requirements', 24, 12, NOW() - INTERVAL '150 days'),
('Agile Development', 'Scrum, Kanban, and agile methodologies', 24, 14, NOW() - INTERVAL '120 days'),
('Software Testing', 'Testing strategies and quality assurance', 24, 16, NOW() - INTERVAL '90 days'),

-- Teacher 25 - Mobile Development
('iOS Development', 'Building apps for iPhone and iPad', 25, 16, NOW() - INTERVAL '140 days'),
('Android Development', 'Creating Android applications', 25, 16, NOW() - INTERVAL '110 days'),
('Cross-Platform Development', 'React Native and Flutter', 25, 14, NOW() - INTERVAL '80 days'),

-- Teacher 26 - DevOps
('CI/CD Pipelines', 'Continuous integration and deployment', 26, 12, NOW() - INTERVAL '130 days'),
('Container Orchestration', 'Kubernetes and Docker Swarm', 26, 14, NOW() - INTERVAL '100 days'),
('Infrastructure as Code', 'Terraform and CloudFormation', 26, 16, NOW() - INTERVAL '70 days'),

-- Teacher 27 - UI/UX Design
('User Experience Design', 'Principles of UX design', 27, 12, NOW() - INTERVAL '120 days'),
('UI Design Fundamentals', 'Creating beautiful user interfaces', 27, 14, NOW() - INTERVAL '90 days'),
('Design Systems', 'Building scalable design systems', 27, 16, NOW() - INTERVAL '60 days'),

-- Teacher 28 - Blockchain
('Blockchain Fundamentals', 'Understanding blockchain technology', 28, 14, NOW() - INTERVAL '110 days'),
('Smart Contracts', 'Developing smart contracts with Solidity', 28, 16, NOW() - INTERVAL '80 days'),
('Decentralized Applications', 'Building dApps on Ethereum', 28, 18, NOW() - INTERVAL '50 days'),

-- Teacher 29 - IoT
('Internet of Things Basics', 'Introduction to IoT systems', 29, 12, NOW() - INTERVAL '100 days'),
('IoT Security', 'Securing IoT devices and networks', 29, 14, NOW() - INTERVAL '70 days'),
('Industrial IoT', 'IoT in manufacturing and industry', 29, 16, NOW() - INTERVAL '40 days'),

-- Teacher 30 - Game Development
('Game Design Principles', 'Fundamentals of game design', 30, 14, NOW() - INTERVAL '90 days'),
('Unity Game Development', 'Creating games with Unity engine', 30, 16, NOW() - INTERVAL '60 days'),
('3D Graphics Programming', 'OpenGL and 3D rendering', 30, 18, NOW() - INTERVAL '30 days'),

-- Teacher 31 - Computer Networks
('Computer Networks', 'TCP/IP and network protocols', 31, 15, NOW() - INTERVAL '80 days'),
('Network Programming', 'Socket programming and APIs', 31, 14, NOW() - INTERVAL '50 days'),
('Wireless Networks', 'WiFi, 5G, and wireless technologies', 31, 12, NOW() - INTERVAL '20 days'),

-- Teacher 32 - Operating Systems
('Operating Systems', 'OS concepts and design', 32, 16, NOW() - INTERVAL '70 days'),
('Linux System Administration', 'Managing Linux servers', 32, 14, NOW() - INTERVAL '40 days'),
('Distributed Systems', 'Building distributed applications', 32, 18, NOW() - INTERVAL '10 days'),

-- Teacher 33 - Computer Graphics
('Computer Graphics', 'Rendering and visualization techniques', 33, 16, NOW() - INTERVAL '60 days'),
('Advanced Rendering', 'Ray tracing and global illumination', 33, 18, NOW() - INTERVAL '30 days'),
('Animation and Simulation', 'Character animation and physics', 33, 14, NOW() - INTERVAL '5 days'),

-- Teacher 34 - Natural Language Processing
('Introduction to NLP', 'Text processing and analysis', 34, 15, NOW() - INTERVAL '50 days'),
('Advanced NLP', 'Transformers and language models', 34, 18, NOW() - INTERVAL '20 days'),
('Conversational AI', 'Building chatbots and assistants', 34, 16, NOW() - INTERVAL '3 days'),

-- Teacher 35 - Computer Vision
('Computer Vision Basics', 'Image processing fundamentals', 35, 14, NOW() - INTERVAL '40 days'),
('Object Detection and Recognition', 'CNN-based detection systems', 35, 16, NOW() - INTERVAL '10 days'),
('Video Analysis', 'Processing and analyzing video data', 35, 18, NOW() - INTERVAL '1 day');

-- Demo courses were never edited. Without this, updated_at defaults to the moment the seed ran,
-- and the admin activity feed shows every course as "Updated" just now.
UPDATE courses SET updated_at = created_at;
