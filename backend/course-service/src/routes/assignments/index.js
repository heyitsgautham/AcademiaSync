const express = require('express');
const { validateIdParams } = require('../../middleware/validate');
const registerManageRoutes = require('./manage');
const registerGradingRoutes = require('./grading');
const registerOverviewRoutes = require('./overview');

/**
 * Teacher assignment routes, mounted at /api/teacher.
 * Each route checks the teacher role itself, and every query is scoped to the teacher's own courses.
 * @param {Pool} pool - PostgreSQL connection pool
 * @returns {Router} Express router
 */
module.exports = (pool) => {
    const router = express.Router();
    validateIdParams(router, ['id', 'courseId', 'assignmentId', 'submissionId']);

    registerManageRoutes(router, pool);
    registerGradingRoutes(router, pool);
    registerOverviewRoutes(router, pool);

    return router;
};
