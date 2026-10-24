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
        global: { statements: 75, branches: 55, functions: 70, lines: 75 },
    },
    testTimeout: 10000,
};
