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
