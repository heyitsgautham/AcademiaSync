const {
    parsePagination,
    parseSorting,
    buildPaginationMeta,
    buildStudentAssignmentsFilter,
    buildSubmissionsFilter,
    buildStudentsFilter,
} = require('../src/utils/query-helpers');

describe('parsePagination', () => {
    it('defaults to page 1 with 10 items', () => {
        expect(parsePagination({})).toEqual({ page: 1, limit: 10, offset: 0 });
    });

    it('caps the page size at 50 and floors bad pages at 1', () => {
        expect(parsePagination({ page: '-3', limit: '500' })).toEqual({ page: 1, limit: 50, offset: 0 });
        expect(parsePagination({ page: '3', limit: '20' })).toEqual({ page: 3, limit: 20, offset: 40 });
    });
});

describe('parseSorting', () => {
    it('falls back to the first allowed field and ascending order', () => {
        expect(parseSorting({ sortBy: 'password', sortOrder: 'sideways' }, ['name', 'grade'])).toEqual({
            sortField: 'name',
            sortOrder: 'ASC',
            orderByClause: 'name ASC NULLS LAST',
        });
    });

    it('accepts the short sort and order aliases', () => {
        expect(parseSorting({ sort: 'grade', order: 'desc' }, ['name', 'grade']).orderByClause).toBe(
            'grade DESC NULLS LAST'
        );
    });

    it('orders by the mapped column when one is given', () => {
        expect(parseSorting({ sortBy: 'title' }, ['due_date', 'title'], { title: 'a.title' }).orderByClause).toBe(
            'a.title ASC NULLS LAST'
        );
    });
});

describe('buildPaginationMeta', () => {
    it('describes the neighbouring pages', () => {
        expect(buildPaginationMeta(25, 2, 10)).toEqual({
            currentPage: 2,
            totalPages: 3,
            totalItems: 25,
            itemsPerPage: 10,
            hasNextPage: true,
            hasPrevPage: true,
            nextPage: 3,
            prevPage: 1,
        });
    });
});

describe('buildStudentAssignmentsFilter', () => {
    it('returns an empty clause without filters', () => {
        expect(buildStudentAssignmentsFilter({})).toEqual({ whereClause: '', values: [], hasFilters: false });
    });

    it('numbers the course placeholder after the caller parameters', () => {
        expect(buildStudentAssignmentsFilter({ course: '7', status: 'graded' }, 2)).toEqual({
            whereClause: 'AND a.course_id = $2 AND s.grade IS NOT NULL',
            values: [7],
            hasFilters: true,
        });
    });

    it('ignores a non-numeric course and an unknown status', () => {
        expect(buildStudentAssignmentsFilter({ course: 'abc', status: 'lost' }, 2).hasFilters).toBe(false);
    });
});

describe('buildSubmissionsFilter', () => {
    it('combines status and grade bounds starting at the given placeholder', () => {
        expect(buildSubmissionsFilter({ status: 'graded', minGrade: '50', maxGrade: '90.5' }, 3)).toEqual({
            whereClause: 'AND s.grade IS NOT NULL AND s.grade >= $3 AND s.grade <= $4',
            values: [50, 90.5],
            hasFilters: true,
        });
    });
});

describe('buildStudentsFilter', () => {
    it('filters by course id', () => {
        expect(buildStudentsFilter({ courseId: '4' }, 2)).toEqual({
            whereClause: 'AND c.id = $2',
            values: [4],
            hasFilters: true,
        });
    });
});
