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
 * @param {Object} columnMap - Optional map from a sort field to the SQL expression to order by,
 *   for fields that would be ambiguous across joined tables
 * @returns {Object} - { sortField, sortOrder, orderByClause }
 */
function parseSorting(query, allowedFields = [], columnMap = {}) {
    const sortBy = query.sortBy || query.sort;
    const sortOrder = String(query.sortOrder || query.order || 'asc').toUpperCase();

    // Validate sort order
    const validOrder = ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : 'ASC';

    // Validate sort field
    const validFields = allowedFields.length > 0 ? allowedFields : ['id', 'created_at', 'updated_at'];
    const sortField = validFields.includes(sortBy) ? sortBy : validFields[0];
    const column = columnMap[sortField] || sortField;

    // Rows with no value (an ungraded submission, say) go last in both directions
    return {
        sortField,
        sortOrder: validOrder,
        orderByClause: `${column} ${validOrder} NULLS LAST`,
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
        prevPage: page > 1 ? page - 1 : null,
    };
}

/**
 * Collects SQL conditions with numbered placeholders.
 * Placeholders start at `startIndex` so they follow the parameters the caller already uses.
 */
function createConditionBuilder(startIndex) {
    const conditions = [];
    const values = [];

    return {
        add(sqlWithPlaceholder, value) {
            values.push(value);
            conditions.push(sqlWithPlaceholder.replace('?', `$${startIndex + values.length - 1}`));
        },
        addRaw(sql) {
            conditions.push(sql);
        },
        build() {
            return {
                whereClause: conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '',
                values,
                hasFilters: conditions.length > 0,
            };
        },
    };
}

const isNumeric = (value) => value !== undefined && value !== '' && !isNaN(value);

/**
 * Apply filters to SQL query for student assignments
 * @param {Object} query - Express req.query object
 * @param {number} startIndex - First free placeholder number in the caller's query
 * @returns {Object} - { whereClause, values, hasFilters }, where whereClause starts with AND
 */
function buildStudentAssignmentsFilter(query, startIndex = 1) {
    const builder = createConditionBuilder(startIndex);

    if (isNumeric(query.course)) {
        builder.add('a.course_id = ?', parseInt(query.course));
    }

    if (query.status) {
        const status = String(query.status).toLowerCase();
        if (status === 'pending') {
            builder.addRaw('s.id IS NULL');
        } else if (status === 'submitted') {
            builder.addRaw('s.id IS NOT NULL AND s.grade IS NULL');
        } else if (status === 'graded') {
            builder.addRaw('s.grade IS NOT NULL');
        }
    }

    return builder.build();
}

/**
 * Apply filters to SQL query for assignment submissions
 * @param {Object} query - Express req.query object
 * @param {number} startIndex - First free placeholder number in the caller's query
 * @returns {Object} - { whereClause, values, hasFilters }, where whereClause starts with AND
 */
function buildSubmissionsFilter(query, startIndex = 1) {
    const builder = createConditionBuilder(startIndex);

    if (query.status) {
        const status = String(query.status).toLowerCase();
        if (status === 'submitted') {
            builder.addRaw('s.id IS NOT NULL');
        } else if (status === 'not-submitted') {
            builder.addRaw('s.id IS NULL');
        } else if (status === 'graded') {
            builder.addRaw('s.grade IS NOT NULL');
        }
    }

    if (isNumeric(query.minGrade)) {
        builder.add('s.grade >= ?', parseFloat(query.minGrade));
    }

    if (isNumeric(query.maxGrade)) {
        builder.add('s.grade <= ?', parseFloat(query.maxGrade));
    }

    return builder.build();
}

/**
 * Apply filters to SQL query for students by course
 * @param {Object} query - Express req.query object
 * @param {number} startIndex - First free placeholder number in the caller's query
 * @returns {Object} - { whereClause, values, hasFilters }, where whereClause starts with AND
 */
function buildStudentsFilter(query, startIndex = 1) {
    const builder = createConditionBuilder(startIndex);

    if (isNumeric(query.courseId)) {
        builder.add('c.id = ?', parseInt(query.courseId));
    }

    return builder.build();
}

module.exports = {
    parsePagination,
    parseSorting,
    buildPaginationMeta,
    buildStudentAssignmentsFilter,
    buildSubmissionsFilter,
    buildStudentsFilter,
};
