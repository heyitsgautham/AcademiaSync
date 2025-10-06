const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AcademiaSync Course Service API',
            version: '1.0.0',
            description: 'Course management, assignments, enrollments, and analytics for AcademiaSync platform',
            contact: {
                name: 'AcademiaSync Team',
                email: 'support@academiasync.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: process.env.API_BASE_URL || 'http://localhost:5001',
                description: 'API Server',
            },
            {
                url: 'http://course-service:5001',
                description: 'Docker internal network',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT authorization using Bearer scheme. Example: "Bearer {token}"',
                },
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'accessToken',
                    description: 'JWT token stored in httpOnly cookie',
                },
            },
            schemas: {
                Course: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Course ID',
                        },
                        title: {
                            type: 'string',
                            description: 'Course title',
                        },
                        description: {
                            type: 'string',
                            description: 'Course description',
                        },
                        teacherId: {
                            type: 'integer',
                            description: 'ID of the teacher who created the course',
                        },
                        teacherName: {
                            type: 'string',
                            description: 'Name of the teacher',
                        },
                        weeks: {
                            type: 'integer',
                            description: 'Duration in weeks',
                        },
                        category: {
                            type: 'string',
                            description: 'Course category',
                        },
                        imageUrl: {
                            type: 'string',
                            description: 'Course image URL',
                        },
                        studentsEnrolled: {
                            type: 'integer',
                            description: 'Number of enrolled students',
                        },
                    },
                },
                Assignment: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Assignment ID',
                        },
                        title: {
                            type: 'string',
                            description: 'Assignment title',
                        },
                        description: {
                            type: 'string',
                            description: 'Assignment description',
                        },
                        courseId: {
                            type: 'integer',
                            description: 'Course ID',
                        },
                        dueDate: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Assignment due date',
                        },
                        maxGrade: {
                            type: 'number',
                            description: 'Maximum possible grade',
                        },
                    },
                },
                Enrollment: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Enrollment ID',
                        },
                        studentId: {
                            type: 'integer',
                            description: 'Student ID',
                        },
                        courseId: {
                            type: 'integer',
                            description: 'Course ID',
                        },
                        enrolledAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Enrollment timestamp',
                        },
                    },
                },
                Submission: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Submission ID',
                        },
                        assignmentId: {
                            type: 'integer',
                            description: 'Assignment ID',
                        },
                        studentId: {
                            type: 'integer',
                            description: 'Student ID',
                        },
                        content: {
                            type: 'string',
                            description: 'Submission content',
                        },
                        fileUrl: {
                            type: 'string',
                            description: 'Submitted file URL',
                        },
                        grade: {
                            type: 'number',
                            description: 'Grade received',
                        },
                        feedback: {
                            type: 'string',
                            description: 'Teacher feedback',
                        },
                        submittedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Submission timestamp',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error message',
                        },
                        message: {
                            type: 'string',
                            description: 'Detailed error description',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
            {
                cookieAuth: [],
            },
        ],
        tags: [
            {
                name: 'Courses',
                description: 'Course management endpoints',
            },
            {
                name: 'Assignments',
                description: 'Assignment management endpoints',
            },
            {
                name: 'Enrollments',
                description: 'Course enrollment endpoints',
            },
            {
                name: 'Submissions',
                description: 'Assignment submission endpoints',
            },
            {
                name: 'Analytics',
                description: 'Analytics and statistics endpoints',
            },
            {
                name: 'Teacher',
                description: 'Teacher-specific endpoints',
            },
            {
                name: 'Student',
                description: 'Student-specific endpoints',
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Path to route files with JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
