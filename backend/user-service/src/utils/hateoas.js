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

module.exports = {
    createLink,
    addTeacherLinks,
    addStudentLinks,
    addAdminLinks,
};
