const { z } = require('zod');

// Form fields often arrive as strings, so numeric strings are accepted and converted.
const toNumber = (value) => (typeof value === 'string' && value.trim() !== '' && !isNaN(value) ? Number(value) : value);
const emptyToNull = (value) => (value === '' ? null : value);

const positiveInt = (name) =>
    z.preprocess(
        toNumber,
        z
            .number({ required_error: `${name} is required`, invalid_type_error: `${name} must be a positive integer` })
            .int(`${name} must be a positive integer`)
            .positive(`${name} must be a positive integer`)
            .max(2147483647, `${name} is too large`)
    );

const requiredText = (name, max) => {
    const text = z
        .string({ required_error: `${name} is required`, invalid_type_error: `${name} must be text` })
        .trim()
        .min(1, `${name} is required`);
    return max ? text.max(max, `${name} must be at most ${max} characters`) : text;
};

const grade = z.preprocess(
    toNumber,
    z
        .number({ invalid_type_error: 'Grade must be a number' })
        .min(0, 'Grade must be between 0 and 100')
        .max(100, 'Grade must be between 0 and 100')
        .nullable()
        .optional()
);

const optionalDate = (name) =>
    z.preprocess(
        emptyToNull,
        z
            .string({ invalid_type_error: `${name} must be a date string` })
            .refine((value) => !Number.isNaN(Date.parse(value)), `${name} must be a valid date`)
            .nullable()
            .optional()
    );

module.exports = { z, toNumber, emptyToNull, positiveInt, requiredText, grade, optionalDate };
