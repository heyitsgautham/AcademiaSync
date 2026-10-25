/**
 * Reads a secret that has no safe default.
 * A missing or blank value stops the service at startup, because a fallback string
 * written in this repository would let anyone who reads it sign tokens the service accepts.
 * @param {string} name - Environment variable name
 * @param {NodeJS.ProcessEnv} [env] - Environment to read, process.env by default
 * @returns {string} The secret
 * @throws {Error} If the variable is unset or blank
 */
const requireSecret = (name, env = process.env) => {
    const value = env[name];
    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`${name} is not set. Set it in the environment or in .env before starting the service.`);
    }
    return value;
};

module.exports = { requireSecret };
