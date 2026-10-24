const { z } = require('zod');

/** zod error option that tells a missing value apart from one of the wrong type. */
const typeError = (requiredMessage, invalidMessage) => ({
    error: (issue) => (issue.input === undefined ? requiredMessage : invalidMessage),
});

// Form fields often arrive as strings, so numeric strings are accepted and converted.
const toNumber = (value) => (typeof value === 'string' && value.trim() !== '' && !isNaN(value) ? Number(value) : value);
const emptyToNull = (value) => (value === '' ? null : value);

const positiveInt = (name) =>
    z.preprocess(
        toNumber,
        z
            .number(typeError(`${name} is required`, `${name} must be a positive integer`))
            .int(`${name} must be a positive integer`)
            .positive(`${name} must be a positive integer`)
            .max(2147483647, `${name} is too large`)
    );

const requiredText = (name, max) => {
    const text = z
        .string(typeError(`${name} is required`, `${name} must be text`))
        .trim()
        .min(1, `${name} is required`);
    return max ? text.max(max, `${name} must be at most ${max} characters`) : text;
};

const grade = z.preprocess(
    toNumber,
    z
        .number({ error: 'Grade must be a number' })
        .min(0, 'Grade must be between 0 and 100')
        .max(100, 'Grade must be between 0 and 100')
        .nullable()
        .optional()
);

const optionalDate = (name) =>
    z.preprocess(
        emptyToNull,
        z
            .string({ error: `${name} must be a date string` })
            .refine((value) => !Number.isNaN(Date.parse(value)), `${name} must be a valid date`)
            .nullable()
            .optional()
    );

module.exports = { z, typeError, toNumber, emptyToNull, positiveInt, requiredText, grade, optionalDate };
