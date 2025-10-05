const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AcademiaSync User Service API',
            version: '1.0.0',
            description: 'User management, authentication, and admin operations for AcademiaSync platform',
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
                url: 'http://localhost:5000',
                description: 'Development server',
            },
            {
                url: 'http://user-service:5000',
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
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'User ID',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                        },
                        role: {
                            type: 'string',
                            enum: ['Student', 'Teacher', 'Admin'],
                            description: 'User role',
                        },
                        firstName: {
                            type: 'string',
                            description: 'User first name',
                        },
                        lastName: {
                            type: 'string',
                            description: 'User last name',
                        },
                        age: {
                            type: 'integer',
                            description: 'User age',
                        },
                        profilePicture: {
                            type: 'string',
                            description: 'URL to user profile picture',
                        },
                    },
                },
                Teacher: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                        },
                        email: {
                            type: 'string',
                        },
                        firstName: {
                            type: 'string',
                        },
                        lastName: {
                            type: 'string',
                        },
                        specialization: {
                            type: 'string',
                        },
                        totalStudents: {
                            type: 'integer',
                        },
                        totalCourses: {
                            type: 'integer',
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
                name: 'Authentication',
                description: 'Authentication and authorization endpoints',
            },
            {
                name: 'Admin',
                description: 'Admin operations (requires Admin role)',
            },
            {
                name: 'Users',
                description: 'User management endpoints',
            },
            {
                name: 'Teachers',
                description: 'Teacher-specific endpoints',
            },
            {
                name: 'Dashboard',
                description: 'Dashboard data endpoints',
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Path to route files with JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
