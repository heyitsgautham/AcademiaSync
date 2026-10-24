/**
 * Describes how long ago a date was, in the coarsest whole unit: "5 minutes ago", "1 hour ago", "3 days ago".
 * Anything under two minutes reads as "1 minute ago".
 * @param {Date} date - The past moment
 * @param {Date} now - Reference time, injectable for tests
 * @returns {string}
 */
function formatTimeAgo(date, now = new Date()) {
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
        return diffMins <= 1 ? '1 minute ago' : `${diffMins} minutes ago`;
    }
    if (diffHours < 24) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
}

module.exports = { formatTimeAgo };
