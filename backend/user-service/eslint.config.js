// Shared backend rules live in the repo root's eslint.config.base.cjs.
module.exports = require('../../eslint.config.base.cjs')({
    js: require('@eslint/js'),
    globals: require('globals'),
});
