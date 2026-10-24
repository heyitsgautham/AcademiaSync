/**
 * ADMIN_EMAILS lists the Google accounts that get the Admin role when they sign in,
 * so a fresh install needs no hand-written SQL to create its first admin.
 * Comma separated, case-insensitive, blank entries ignored.
 */
const parseAdminEmails = (value = '') =>
    new Set(
        value
            .split(',')
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean)
    );

const isBootstrapAdmin = (email, env = process.env) =>
    Boolean(email) && parseAdminEmails(env.ADMIN_EMAILS).has(String(email).toLowerCase());

module.exports = { parseAdminEmails, isBootstrapAdmin };
