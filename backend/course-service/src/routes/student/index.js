const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const { validateIdParams } = require('../../middleware/validate');
const registerCourseRoutes = require('./courses');
const registerAssignmentRoutes = require('./assignments');
const registerDashboardRoutes = require('./dashboard');

/**
 * Student routes, mounted at /api/student.
 * Every route needs a signed-in user with the Student role.
 * @param {Pool} pool - PostgreSQL connection pool
 * @returns {Router} Express router
 */
module.exports = (pool) => {
    const router = express.Router();
    validateIdParams(router, ['assignmentId']);

    router.use(authenticate);
    router.use(authorize('Student'));

    registerCourseRoutes(router, pool);
    registerAssignmentRoutes(router, pool);
    registerDashboardRoutes(router, pool);

    return router;
};
