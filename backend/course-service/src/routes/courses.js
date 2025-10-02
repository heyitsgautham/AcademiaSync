const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

module.exports = (pool) => {
    // Get all courses for the authenticated teacher
    router.get('/', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const teacherId = req.user.id;

            const result = await pool.query(
                `SELECT c.id, c.title, c.description, c.weeks, c.created_at, c.updated_at,
                        COUNT(DISTINCT e.student_id) as students_enrolled
                 FROM courses c
                 LEFT JOIN enrollments e ON c.id = e.course_id
                 WHERE c.teacher_id = $1
                 GROUP BY c.id
                 ORDER BY c.created_at DESC`,
                [teacherId]
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching courses:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    // Get a single course by ID
    router.get('/:id', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { id } = req.params;
            const teacherId = req.user.id;

            const result = await pool.query(
                `SELECT c.*, COUNT(DISTINCT e.student_id) as students_enrolled
                 FROM courses c
                 LEFT JOIN enrollments e ON c.id = e.course_id
                 WHERE c.id = $1 AND c.teacher_id = $2
                 GROUP BY c.id`,
                [id, teacherId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Course not found or access denied'
                });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching course:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    // Create a new course
    router.post('/', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { title, description, weeks } = req.body;
            const teacherId = req.user.id;

            // Validation
            if (!title || !description) {
                return res.status(400).json({
                    error: 'Bad request',
                    message: 'Title and description are required'
                });
            }

            const result = await pool.query(
                `INSERT INTO courses (title, description, teacher_id, weeks)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [title, description, teacherId, weeks || null]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating course:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    // Update a course
    router.put('/:id', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { id } = req.params;
            const { title, description, weeks } = req.body;
            const teacherId = req.user.id;

            // Validation
            if (!title || !description) {
                return res.status(400).json({
                    error: 'Bad request',
                    message: 'Title and description are required'
                });
            }

            // Check if course exists and belongs to teacher
            const checkResult = await pool.query(
                'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
                [id, teacherId]
            );

            if (checkResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Course not found or access denied'
                });
            }

            const result = await pool.query(
                `UPDATE courses
                 SET title = $1, description = $2, weeks = $3, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $4 AND teacher_id = $5
                 RETURNING *`,
                [title, description, weeks || null, id, teacherId]
            );

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating course:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    // Delete a course
    router.delete('/:id', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { id } = req.params;
            const teacherId = req.user.id;

            // Check if course exists and belongs to teacher
            const checkResult = await pool.query(
                'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
                [id, teacherId]
            );

            if (checkResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Course not found or access denied'
                });
            }

            await pool.query(
                'DELETE FROM courses WHERE id = $1 AND teacher_id = $2',
                [id, teacherId]
            );

            res.status(204).send();
        } catch (error) {
            console.error('Error deleting course:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    return router;
};
