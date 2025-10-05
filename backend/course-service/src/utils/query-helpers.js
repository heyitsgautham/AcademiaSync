/**
 * Query Helper Utilities for Pagination, Filtering, and Sorting
 */

/**
 * Parse pagination parameters from query
 * @param {Object} query - Express req.query object
 * @returns {Object} - { page, limit, offset }
 */
function parsePagination(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10)); // Max 50 per page
    const offset = (page - 1) * limit;

    return { page, limit, offset };
}

/**
 * Parse sorting parameters from query
 * @param {Object} query - Express req.query object
 * @param {Array} allowedFields - Array of allowed sort fields
 * @returns {Object} - { sortField, sortOrder, orderByClause }
 */
function parseSorting(query, allowedFields = []) {
    const sortBy = query.sortBy || query.sort;
    const sortOrder = (query.sortOrder || query.order || 'asc').toUpperCase();

    // Validate sort order
    const validOrder = ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : 'ASC';

    // Validate sort field
    const validFields = allowedFields.length > 0 ? allowedFields : ['id', 'created_at', 'updated_at'];
    const sortField = validFields.includes(sortBy) ? sortBy : validFields[0];

    return {
        sortField,
        sortOrder: validOrder,
        orderByClause: `${sortField} ${validOrder}`
    };
}

/**
 * Build pagination metadata
 * @param {number} totalItems - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} - Pagination metadata
 */
function buildPaginationMeta(totalItems, page, limit) {
    const totalPages = Math.ceil(totalItems / limit);

    return {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
    };
}

/**
 * Apply filters to SQL query for student assignments
 * @param {Object} query - Express req.query object
 * @returns {Object} - { whereClause, values, hasFilters }
 */
function buildStudentAssignmentsFilter(query) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Course filter
    if (query.course && !isNaN(query.course)) {
        conditions.push(`a.course_id = $${paramIndex}`);
        values.push(parseInt(query.course));
        paramIndex++;
    }

    // Status filter
    if (query.status) {
        const status = query.status.toLowerCase();
        if (status === 'pending') {
            conditions.push(`s.id IS NULL`);
        } else if (status === 'submitted') {
            conditions.push(`s.id IS NOT NULL AND s.grade IS NULL`);
        } else if (status === 'graded') {
            conditions.push(`s.grade IS NOT NULL`);
        }
    }

    const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

    return {
        whereClause,
        values,
        hasFilters: conditions.length > 0
    };
}

/**
 * Apply filters to SQL query for assignment submissions
 * @param {Object} query - Express req.query object
 * @returns {Object} - { whereClause, values, hasFilters }
 */
function buildSubmissionsFilter(query) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Status filter for submissions
    if (query.status) {
        const status = query.status.toLowerCase();
        if (status === 'submitted') {
            conditions.push(`s.id IS NOT NULL`);
        } else if (status === 'not-submitted') {
            conditions.push(`s.id IS NULL`);
        } else if (status === 'graded') {
            conditions.push(`s.grade IS NOT NULL`);
        }
    }

    // Grade filter
    if (query.minGrade && !isNaN(query.minGrade)) {
        conditions.push(`s.grade >= $${paramIndex}`);
        values.push(parseFloat(query.minGrade));
        paramIndex++;
    }

    if (query.maxGrade && !isNaN(query.maxGrade)) {
        conditions.push(`s.grade <= $${paramIndex}`);
        values.push(parseFloat(query.maxGrade));
        paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return {
        whereClause,
        values,
        hasFilters: conditions.length > 0
    };
}

/**
 * Apply filters to SQL query for students by course
 * @param {Object} query - Express req.query object
 * @returns {Object} - { whereClause, values, hasFilters }
 */
function buildStudentsFilter(query) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Course filter
    if (query.courseId && !isNaN(query.courseId)) {
        conditions.push(`c.id = $${paramIndex}`);
        values.push(parseInt(query.courseId));
        paramIndex++;
    }

    // Performance/grade filter
    if (query.minGrade && !isNaN(query.minGrade)) {
        conditions.push(`COALESCE(AVG(s.grade), 0) >= $${paramIndex}`);
        values.push(parseFloat(query.minGrade));
        paramIndex++;
    }

    if (query.maxGrade && !isNaN(query.maxGrade)) {
        conditions.push(`COALESCE(AVG(s.grade), 0) <= $${paramIndex}`);
        values.push(parseFloat(query.maxGrade));
        paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return {
        whereClause,
        values,
        hasFilters: conditions.length > 0
    };
}

module.exports = {
    parsePagination,
    parseSorting,
    buildPaginationMeta,
    buildStudentAssignmentsFilter,
    buildSubmissionsFilter,
    buildStudentsFilter
};