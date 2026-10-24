const { formatTimeAgo } = require('../src/utils/time');

const now = new Date('2026-01-10T12:00:00Z');
const ago = (ms) => new Date(now.getTime() - ms);
const MIN = 60000;

describe('formatTimeAgo', () => {
    it.each([
        [0, '1 minute ago'],
        [1.5 * MIN, '1 minute ago'],
        [2 * MIN, '2 minutes ago'],
        [59 * MIN, '59 minutes ago'],
        [60 * MIN, '1 hour ago'],
        [23 * 60 * MIN, '23 hours ago'],
        [24 * 60 * MIN, '1 day ago'],
        [10 * 24 * 60 * MIN, '10 days ago'],
    ])('describes %d ms as "%s"', (ms, expected) => {
        expect(formatTimeAgo(ago(ms), now)).toBe(expected);
    });
});
