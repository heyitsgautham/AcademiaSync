-- Initialize AcademiaSync Database Schema

-- Users table with role-based access (Student, Teacher, Admin)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (
        role IN ('Student', 'Teacher', 'Admin')
    ),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    age INTEGER,
    specialization VARCHAR(255), -- For teachers
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id INTEGER NOT NULL,
    weeks INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Enrollments table (students enrolled in courses)
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    UNIQUE (student_id, course_id)
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
);

-- Assignment submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    submission_text TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade DECIMAL(5, 2),
    feedback TEXT,
    FOREIGN KEY (assignment_id) REFERENCES assignments (id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE (assignment_id, student_id)
);

-- Refresh tokens table for JWT token management
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses (teacher_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments (student_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments (course_id);

CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments (course_id);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions (assignment_id);

CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions (student_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens (user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens (token);

-- Insert seed data for testing
-- Admin user
INSERT INTO
    users (
        email,
        password_hash,
        role,
        first_name,
        last_name
    )
VALUES (
        'admin@academiasync.com',
        '$2b$10$dummy.hash.for.seed.data.only',
        'Admin',
        'System',
        'Admin'
    )
ON CONFLICT (email) DO NOTHING;


-- Sample teacher
INSERT INTO
    users (
        email,
        password_hash,
        role,
        first_name,
        last_name,
        specialization
    )
VALUES (
        'teacher@academiasync.com',
        '$2b$10$dummy.hash.for.seed.data.only',
        'Teacher',
        'John',
        'Doe',
        'Computer Science'
    )
ON CONFLICT (email) DO NOTHING;


-- Sample student
INSERT INTO
    users (
        email,
        password_hash,
        role,
        first_name,
        last_name,
        age
    )
VALUES (
        'student@academiasync.com',
        '$2b$10$dummy.hash.for.seed.data.only',
        'Student',
        'Jane',
        'Smith',
        20
    )
ON CONFLICT (email) DO NOTHING;

