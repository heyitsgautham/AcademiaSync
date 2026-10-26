/**
 * ESLint rules shared by backend/user-service and backend/course-service.
 * Each service's eslint.config.js passes in its own @eslint/js and globals,
 * so the repo root needs no node_modules. The frontend has its own Next.js config.
 * @param {{ js: typeof import('@eslint/js'), globals: typeof import('globals') }} deps
 */
module.exports = ({ js, globals }) => [
    { ignores: ['coverage/', 'logs/', 'node_modules/'] },
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: { ...globals.node },
        },
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
            eqeqeq: ['error', 'always'],
            'no-var': 'error',
            'prefer-const': 'error',
        },
    },
    {
        files: ['tests/**/*.js'],
        languageOptions: { globals: { ...globals.jest } },
    },
];
