module.exports = {
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/tests/helpers/env.js'],
    globalSetup: '<rootDir>/tests/helpers/global-setup.js',
    testPathIgnorePatterns: ['/node_modules/', '/tests/helpers/'],
    // Every suite shares one Postgres database, so suites run one at a time.
    maxWorkers: 1,
    collectCoverageFrom: ['src/**/*.js', '!src/config/swagger.js'],
    coveragePathIgnorePatterns: ['/node_modules/'],
    coverageReporters: ['text-summary', 'lcov'],
    coverageThreshold: {
        global: { statements: 80, branches: 65, functions: 80, lines: 80 },
    },
    testTimeout: 10000,
};
