const { z } = require('zod');

// Form fields often arrive as strings, so numeric strings are accepted and converted.
const toNumber = (value) => (typeof value === 'string' && value.trim() !== '' && !isNaN(value) ? Number(value) : value);
const emptyToNull = (value) => (value === '' ? null : value);

module.exports = { z, toNumber, emptyToNull };
