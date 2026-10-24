const { z, typeError, toNumber, emptyToNull } = require('./common');

// Each field gets the message the route used before validation moved here, so clients see the same text.
const text = (message, max = 255) =>
    z.string(typeError(message, message)).trim().min(1, message).max(max, `Must be at most ${max} characters`);

const optionalText = (max = 255) =>
    z.string({ error: 'Must be text' }).trim().max(max, `Must be at most ${max} characters`).nullable().optional();

const googleSignInBody = z.object({
    idToken: text('Google ID token is required', 4096),
});

const ALL_FIELDS = 'All fields are required';
const createTeacherBody = z.object({
    firstName: text(ALL_FIELDS, 100),
    lastName: text(ALL_FIELDS, 100),
    email: text(ALL_FIELDS).email('Email must be a valid address'),
    specialization: text(ALL_FIELDS),
    password: z
        .string(typeError(ALL_FIELDS, ALL_FIELDS))
        .min(1, ALL_FIELDS)
        .min(6, 'Password must be at least 6 characters')
        .max(72, 'Password must be at most 72 characters'),
});

const TEACHER_FIELDS = 'First name, last name, and specialization are required';
const updateTeacherBody = z.object({
    firstName: text(TEACHER_FIELDS, 100),
    lastName: text(TEACHER_FIELDS, 100),
    specialization: text(TEACHER_FIELDS),
});

const ROLE_FIELDS = 'User ID and new role are required';
const promoteRoleBody = z
    .object({
        userId: z.preprocess(
            toNumber,
            z
                .number(typeError(ROLE_FIELDS, 'userId must be a positive integer'))
                .int('userId must be a positive integer')
                .positive('userId must be a positive integer')
                .max(2147483647, 'userId is too large')
        ),
        newRole: z
            .string(typeError(ROLE_FIELDS, ROLE_FIELDS))
            .min(1, ROLE_FIELDS)
            .refine((role) => ['Teacher', 'Admin'].includes(role), 'Invalid role. Must be Teacher or Admin'),
        specialization: optionalText(),
    })
    .refine((body) => body.newRole !== 'Teacher' || body.specialization, {
        message: 'Specialization is required for Teacher role',
    });

const adminProfileBody = z.object({
    first_name: text('First name is required', 100),
    last_name: optionalText(100),
});

const userProfileBody = z.object({
    first_name: text('First name is required', 100),
    last_name: optionalText(100),
    age: z.preprocess(
        (value) => toNumber(emptyToNull(value)),
        z
            .number({ error: 'Age must be a number' })
            .int('Age must be a whole number')
            .min(18, 'Age must be between 18 and 100')
            .max(100, 'Age must be between 18 and 100')
            .nullable()
            .optional()
    ),
    specialization: optionalText(),
});

module.exports = {
    googleSignInBody,
    createTeacherBody,
    updateTeacherBody,
    promoteRoleBody,
    adminProfileBody,
    userProfileBody,
};
