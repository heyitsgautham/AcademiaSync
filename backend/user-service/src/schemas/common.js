const { z } = require('zod');

/** zod error option that tells a missing value apart from one of the wrong type. */
const typeError = (requiredMessage, invalidMessage) => ({
    error: (issue) => (issue.input === undefined ? requiredMessage : invalidMessage),
});

// Form fields often arrive as strings, so numeric strings are accepted and converted.
const toNumber = (value) => (typeof value === 'string' && value.trim() !== '' && !isNaN(value) ? Number(value) : value);
const emptyToNull = (value) => (value === '' ? null : value);

module.exports = { z, typeError, toNumber, emptyToNull };
