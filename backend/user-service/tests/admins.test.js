const { parseAdminEmails, isBootstrapAdmin } = require('../src/config/admins');

describe('ADMIN_EMAILS parsing', () => {
    it('splits on commas, trims, lowercases and drops blanks', () => {
        expect([...parseAdminEmails(' A@Example.com,,b@example.com , ')]).toEqual(['a@example.com', 'b@example.com']);
    });

    it('treats an unset variable as no admins', () => {
        expect(parseAdminEmails(undefined).size).toBe(0);
        expect(isBootstrapAdmin('a@example.com', {})).toBe(false);
    });

    it('matches emails without case', () => {
        expect(isBootstrapAdmin('A@EXAMPLE.COM', { ADMIN_EMAILS: 'a@example.com' })).toBe(true);
    });

    it('never matches an empty email', () => {
        expect(isBootstrapAdmin('', { ADMIN_EMAILS: 'a@example.com' })).toBe(false);
    });
});
