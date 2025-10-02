const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

module.exports = (pool) => {
    // Get all assignments for a specific course
    router.get('/courses/:courseId/assignments', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { courseId } = req.params;
            const teacherId = req.user.id;

            // Verify the course belongs to the teacher
            const courseCheck = await pool.query(
                'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
                [courseId, teacherId]
            );

            if (courseCheck.rows.length === 0) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Course not found or access denied'
                });
            }

            const result = await pool.query(
                `SELECT a.id, a.course_id, a.title, a.description, a.due_date, a.created_at, a.updated_at,
                        COUNT(s.id) as submission_count
                 FROM assignments a
                 LEFT JOIN submissions s ON a.id = s.assignment_id
                 WHERE a.course_id = $1
                 GROUP BY a.id
                 ORDER BY a.due_date ASC`,
                [courseId]
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    // Create a new assignment for a course
    router.post('/courses/:courseId/assignments', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { courseId } = req.params;
            const { title, description, due_date } = req.body;
            const teacherId = req.user.id;

            // Validation
            if (!title || !description) {
                return res.status(400).json({
                    error: 'Bad request',
                    message: 'Title and description are required'
                });
            }

            // Verify the course belongs to the teacher
            const courseCheck = await pool.query(
                'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
                [courseId, teacherId]
            );

            if (courseCheck.rows.length === 0) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Course not found or access denied'
                });
            }

            const result = await pool.query(
                `INSERT INTO assignments (course_id, title, description, due_date)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [courseId, title, description, due_date || null]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating assignment:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    // Get a single assignment by ID
    router.get('/assignments/:id', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { id } = req.params;
            const teacherId = req.user.id;

            const result = await pool.query(
                `SELECT a.*, c.teacher_id
                 FROM assignments a
                 JOIN courses c ON a.course_id = c.id
                 WHERE a.id = $1 AND c.teacher_id = $2`,
                [id, teacherId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Assignment not found or access denied'
                });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching assignment:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    // Update an assignment
    router.put('/assignments/:id', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { id } = req.params;
            const { title, description, due_date } = req.body;
            const teacherId = req.user.id;

            // Validation
            if (!title || !description) {
                return res.status(400).json({
                    error: 'Bad request',
                    message: 'Title and description are required'
                });
            }

            // Check if assignment exists and belongs to teacher's course
            const checkResult = await pool.query(
                `SELECT a.id FROM assignments a
                 JOIN courses c ON a.course_id = c.id
                 WHERE a.id = $1 AND c.teacher_id = $2`,
                [id, teacherId]
            );

            if (checkResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Assignment not found or access denied'
                });
            }

            const result = await pool.query(
                `UPDATE assignments
                 SET title = $1, description = $2, due_date = $3, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $4
                 RETURNING *`,
                [title, description, due_date || null, id]
            );

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating assignment:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    // Delete an assignment
    router.delete('/assignments/:id', authenticate, authorize('teacher'), async (req, res) => {
        try {
            const { id } = req.params;
            const teacherId = req.user.id;

            // Check if assignment exists and belongs to teacher's course
            const checkResult = await pool.query(
                `SELECT a.id FROM assignments a
                 JOIN courses c ON a.course_id = c.id
                 WHERE a.id = $1 AND c.teacher_id = $2`,
                [id, teacherId]
            );

            if (checkResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Assignment not found or access denied'
                });
            }

            await pool.query('DELETE FROM assignments WHERE id = $1', [id]);

            res.status(204).send();
        } catch (error) {
            console.error('Error deleting assignment:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    });

    return router;
};
