/**
 * HATEOAS (Hypermedia as the Engine of Application State) Utility
 * Provides hypermedia links in API responses to guide clients on available actions
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5000';

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
 * Add HATEOAS links to a course resource
 */
function addCourseLinks(course, userRole, isTeacher = false) {
    const links = [
        createLink('self', `${BASE_URL}/teacher/courses/${course.id}`, 'GET', 'Get course details'),
    ];

    // Only allow modifications if user is the course teacher or admin
    if (isTeacher || userRole === 'Admin') {
        links.push(
            createLink('update', `${BASE_URL}/teacher/courses/${course.id}`, 'PUT', 'Update course'),
            createLink('delete', `${BASE_URL}/teacher/courses/${course.id}`, 'DELETE', 'Delete course'),
            createLink('assignments', `${BASE_URL}/teacher/courses/${course.id}/assignments`, 'GET', 'Get course assignments'),
            createLink('create-assignment', `${BASE_URL}/teacher/courses/${course.id}/assignments`, 'POST', 'Create new assignment'),
            createLink('students', `${BASE_URL}/teacher/students-by-course?courseId=${course.id}`, 'GET', 'Get enrolled students')
        );
    }

    if (userRole === 'Student') {
        links.push(
            createLink('enroll', `${BASE_URL}/student/courses/${course.id}/enroll`, 'POST', 'Enroll in course'),
            createLink('assignments', `${BASE_URL}/student/courses/${course.id}/assignments`, 'GET', 'Get course assignments')
        );
    }

    return { ...course, _links: links };
}

/**
 * Add HATEOAS links to an assignment resource
 */
function addAssignmentLinks(assignment, userRole, isTeacher = false) {
    const links = [
        createLink('self', `${BASE_URL}/student/assignments/${assignment.id}`, 'GET', 'Get assignment details'),
    ];

    if (isTeacher || userRole === 'Admin') {
        links.push(
            createLink('update', `${BASE_URL}/teacher/assignments/${assignment.id}`, 'PUT', 'Update assignment'),
            createLink('delete', `${BASE_URL}/teacher/assignments/${assignment.id}`, 'DELETE', 'Delete assignment'),
            createLink('submissions', `${BASE_URL}/teacher/assignments/${assignment.id}/submissions`, 'GET', 'View all submissions')
        );
    }

    if (userRole === 'Student') {
        links.push(
            createLink('submit', `${BASE_URL}/student/assignments/${assignment.id}/submit`, 'POST', 'Submit assignment'),
            createLink('my-submission', `${BASE_URL}/student/assignments/${assignment.id}/submission`, 'GET', 'Get my submission')
        );
    }

    if (assignment.course_id || assignment.courseId) {
        links.push(
            createLink('course', `${BASE_URL}/teacher/courses/${assignment.course_id || assignment.courseId}`, 'GET', 'Get parent course')
        );
    }

    return { ...assignment, _links: links };
}

/**
 * Add HATEOAS links to a submission resource
 */
function addSubmissionLinks(submission, userRole, isTeacher = false) {
    const assignmentId = submission.assignment_id || submission.assignmentId;

    const links = [
        createLink('self', `${BASE_URL}/student/assignments/${assignmentId}/submission`, 'GET', 'Get submission details'),
    ];

    if (isTeacher || userRole === 'Admin') {
        links.push(
            createLink('grade', `${BASE_URL}/teacher/submissions/${submission.id}/grade`, 'POST', 'Grade submission')
        );
    }

    if (assignmentId) {
        links.push(
            createLink('assignment', `${BASE_URL}/student/assignments/${assignmentId}`, 'GET', 'Get assignment details')
        );
    }

    return { ...submission, _links: links };
}

/**
 * Add HATEOAS links to an enrollment resource
 */
function addEnrollmentLinks(enrollment, userRole) {
    const links = [
        createLink('course', `${BASE_URL}/teacher/courses/${enrollment.course_id || enrollment.courseId}`, 'GET', 'Get course details'),
        createLink('assignments', `${BASE_URL}/student/courses/${enrollment.course_id || enrollment.courseId}/assignments`, 'GET', 'Get course assignments'),
    ];

    if (userRole === 'Student') {
        links.push(
            createLink('unenroll', `${BASE_URL}/student/courses/${enrollment.course_id || enrollment.courseId}/unenroll`, 'DELETE', 'Unenroll from course')
        );
    }

    return { ...enrollment, _links: links };
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
 * Add HATEOAS links to teacher dashboard
 */
function addTeacherDashboardLinks() {
    return [
        createLink('self', `${BASE_URL}/teacher/stats`, 'GET', 'Get teacher statistics'),
        createLink('analytics', `${BASE_URL}/teacher/analytics`, 'GET', 'Get detailed analytics'),
        createLink('courses', `${BASE_URL}/teacher/courses`, 'GET', 'Get all courses'),
        createLink('students', `${BASE_URL}/teacher/students-by-course`, 'GET', 'Get students by course'),
        createLink('create-course', `${BASE_URL}/teacher/courses`, 'POST', 'Create new course'),
        createLink('profile', `${USER_SERVICE_URL}/profile`, 'GET', 'Get profile'),
    ];
}

/**
 * Add HATEOAS links to student dashboard
 */
function addStudentDashboardLinks() {
    return [
        createLink('self', `${BASE_URL}/student/dashboard`, 'GET', 'Get student dashboard'),
        createLink('courses', `${BASE_URL}/student/courses`, 'GET', 'Get enrolled courses'),
        createLink('assignments', `${BASE_URL}/student/assignments`, 'GET', 'Get all assignments'),
        createLink('available-courses', `${BASE_URL}/student/available-courses`, 'GET', 'Browse available courses'),
        createLink('profile', `${USER_SERVICE_URL}/profile`, 'GET', 'Get profile'),
    ];
}

module.exports = {
    createLink,
    addCourseLinks,
    addAssignmentLinks,
    addSubmissionLinks,
    addEnrollmentLinks,
    addPaginationLinks,
    addTeacherDashboardLinks,
    addStudentDashboardLinks,
};
