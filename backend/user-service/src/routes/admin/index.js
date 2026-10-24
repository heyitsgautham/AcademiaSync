const express = require('express');
const { validateIdParams } = require('../../middleware/validate');
const registerReportRoutes = require('./reports');
const registerPeopleRoutes = require('./people');
const registerProfileRoutes = require('./profile');

/**
 * Admin routes, mounted at /admin. Each route requires the Admin role.
 * @param {Pool} pool - PostgreSQL connection pool
 * @returns {Router} Express router
 */
module.exports = (pool) => {
    const router = express.Router();
    validateIdParams(router, ['id']);

    registerReportRoutes(router, pool);
    registerPeopleRoutes(router, pool);
    registerProfileRoutes(router, pool);

    return router;
};
