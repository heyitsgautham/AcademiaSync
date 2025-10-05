/**
 * HATEOAS (Hypermedia as the Engine of Application State) Utility
 * Provides hypermedia links in API responses to guide clients on available actions
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const COURSE_SERVICE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:5001';

/**
 * Generate a HATEOAS link object
 * @param {string} rel - The relationship type (e.g., 'self', 'update', 'delete')
 * @param {string} href - The URL for the link
 * @param {string} method - The HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param {string} description - Optional description of the action
 */
function createLink(rel, href, method = 'GET', description = '') {
    const link = {
        rel,
        href,
        method,
    };

    if (description) {
        link.description = description;
    }

    return link;
}

/**
 * Add HATEOAS links to a teacher resource
 */
function addTeacherLinks(teacher, userRole) {
    const links = [
        createLink('self', `${BASE_URL}/admin/teachers/${teacher.id}`, 'GET', 'Get teacher details'),
    ];

    if (userRole === 'Admin') {
        links.push(
            createLink('update', `${BASE_URL}/admin/teachers/${teacher.id}`, 'PUT', 'Update teacher information'),
            createLink('delete', `${BASE_URL}/admin/teachers/${teacher.id}`, 'DELETE', 'Delete teacher'),
            createLink('promote', `${BASE_URL}/admin/promote-role`, 'POST', 'Change user role')
        );
    }

    links.push(
        createLink('courses', `${COURSE_SERVICE_URL}/teacher/courses`, 'GET', 'Get teacher courses')
    );

    return { ...teacher, _links: links };
}

/**
 * Add HATEOAS links to a student resource
 */
function addStudentLinks(student, userRole) {
    const links = [
        createLink('self', `${BASE_URL}/admin/students/${student.id}`, 'GET', 'Get student details'),
    ];

    if (userRole === 'Admin') {
        links.push(
            createLink('promote', `${BASE_URL}/admin/promote-role`, 'POST', 'Change user role')
        );
    }

    links.push(
        createLink('courses', `${COURSE_SERVICE_URL}/student/courses`, 'GET', 'Get enrolled courses'),
        createLink('assignments', `${COURSE_SERVICE_URL}/student/assignments`, 'GET', 'Get assignments')
    );

    return { ...student, _links: links };
}

/**
 * Add HATEOAS links to a course resource
 */
function addCourseLinks(course, userRole, teacherId = null) {
    const links = [
        createLink('self', `${COURSE_SERVICE_URL}/teacher/courses/${course.id}`, 'GET', 'Get course details'),
    ];

    // Only allow modifications if user is the teacher or admin
    if (userRole === 'Teacher' || userRole === 'Admin') {
        links.push(
            createLink('update', `${COURSE_SERVICE_URL}/teacher/courses/${course.id}`, 'PUT', 'Update course'),
            createLink('delete', `${COURSE_SERVICE_URL}/teacher/courses/${course.id}`, 'DELETE', 'Delete course'),
            createLink('assignments', `${COURSE_SERVICE_URL}/teacher/courses/${course.id}/assignments`, 'GET', 'Get course assignments'),
            createLink('create-assignment', `${COURSE_SERVICE_URL}/teacher/courses/${course.id}/assignments`, 'POST', 'Create new assignment')
        );
    }

    links.push(
        createLink('enroll', `${COURSE_SERVICE_URL}/student/courses/${course.id}/enroll`, 'POST', 'Enroll in course')
    );

    return { ...course, _links: links };
}

/**
 * Add HATEOAS links to an assignment resource
 */
function addAssignmentLinks(assignment, userRole, courseId = null) {
    const links = [
        createLink('self', `${COURSE_SERVICE_URL}/student/assignments/${assignment.id}`, 'GET', 'Get assignment details'),
    ];

    if (userRole === 'Teacher' || userRole === 'Admin') {
        links.push(
            createLink('update', `${COURSE_SERVICE_URL}/teacher/assignments/${assignment.id}`, 'PUT', 'Update assignment'),
            createLink('delete', `${COURSE_SERVICE_URL}/teacher/assignments/${assignment.id}`, 'DELETE', 'Delete assignment'),
            createLink('submissions', `${COURSE_SERVICE_URL}/teacher/assignments/${assignment.id}/submissions`, 'GET', 'View all submissions')
        );
    }

    if (userRole === 'Student') {
        links.push(
            createLink('submit', `${COURSE_SERVICE_URL}/student/assignments/${assignment.id}/submit`, 'POST', 'Submit assignment'),
            createLink('submission', `${COURSE_SERVICE_URL}/student/assignments/${assignment.id}/submission`, 'GET', 'Get my submission')
        );
    }

    if (courseId) {
        links.push(
            createLink('course', `${COURSE_SERVICE_URL}/teacher/courses/${courseId}`, 'GET', 'Get parent course')
        );
    }

    return { ...assignment, _links: links };
}

/**
 * Add HATEOAS links to a submission resource
 */
function addSubmissionLinks(submission, userRole, assignmentId = null) {
    const links = [
        createLink('self', `${COURSE_SERVICE_URL}/student/assignments/${assignmentId}/submission`, 'GET', 'Get submission details'),
    ];

    if (userRole === 'Teacher' || userRole === 'Admin') {
        links.push(
            createLink('grade', `${COURSE_SERVICE_URL}/teacher/submissions/${submission.id}/grade`, 'POST', 'Grade submission')
        );
    }

    if (assignmentId) {
        links.push(
            createLink('assignment', `${COURSE_SERVICE_URL}/student/assignments/${assignmentId}`, 'GET', 'Get assignment details')
        );
    }

    return { ...submission, _links: links };
}

/**
 * Add pagination links to a collection response
 */
function addPaginationLinks(baseUrl, currentPage, totalPages, limit) {
    const links = [
        createLink('self', `${baseUrl}?page=${currentPage}&limit=${limit}`, 'GET', 'Current page'),
    ];

    if (currentPage > 1) {
        links.push(
            createLink('first', `${baseUrl}?page=1&limit=${limit}`, 'GET', 'First page'),
            createLink('prev', `${baseUrl}?page=${currentPage - 1}&limit=${limit}`, 'GET', 'Previous page')
        );
    }

    if (currentPage < totalPages) {
        links.push(
            createLink('next', `${baseUrl}?page=${currentPage + 1}&limit=${limit}`, 'GET', 'Next page'),
            createLink('last', `${baseUrl}?page=${totalPages}&limit=${limit}`, 'GET', 'Last page')
        );
    }

    return links;
}

/**
 * Add HATEOAS links to admin stats/analytics
 */
function addAdminLinks() {
    return [
        createLink('self', `${BASE_URL}/admin/stats`, 'GET', 'Get admin statistics'),
        createLink('analytics', `${BASE_URL}/admin/analytics`, 'GET', 'Get detailed analytics'),
        createLink('teachers', `${BASE_URL}/admin/teachers`, 'GET', 'Get all teachers'),
        createLink('students', `${BASE_URL}/admin/students`, 'GET', 'Get all students'),
        createLink('create-teacher', `${BASE_URL}/admin/teachers`, 'POST', 'Create new teacher'),
    ];
}

/**
 * Add HATEOAS links to teacher dashboard
 */
function addTeacherDashboardLinks(teacherId) {
    return [
        createLink('self', `${COURSE_SERVICE_URL}/teacher/stats`, 'GET', 'Get teacher statistics'),
        createLink('analytics', `${COURSE_SERVICE_URL}/teacher/analytics`, 'GET', 'Get detailed analytics'),
        createLink('courses', `${COURSE_SERVICE_URL}/teacher/courses`, 'GET', 'Get all courses'),
        createLink('students', `${COURSE_SERVICE_URL}/teacher/students-by-course`, 'GET', 'Get students by course'),
        createLink('create-course', `${COURSE_SERVICE_URL}/teacher/courses`, 'POST', 'Create new course'),
    ];
}

/**
 * Add HATEOAS links to student dashboard
 */
function addStudentDashboardLinks(studentId) {
    return [
        createLink('self', `${COURSE_SERVICE_URL}/student/dashboard`, 'GET', 'Get student dashboard'),
        createLink('courses', `${COURSE_SERVICE_URL}/student/courses`, 'GET', 'Get enrolled courses'),
        createLink('assignments', `${COURSE_SERVICE_URL}/student/assignments`, 'GET', 'Get all assignments'),
        createLink('profile', `${BASE_URL}/profile`, 'GET', 'Get profile'),
    ];
}

module.exports = {
    createLink,
    addTeacherLinks,
    addStudentLinks,
    addCourseLinks,
    addAssignmentLinks,
    addSubmissionLinks,
    addPaginationLinks,
    addAdminLinks,
    addTeacherDashboardLinks,
    addStudentDashboardLinks,
};
