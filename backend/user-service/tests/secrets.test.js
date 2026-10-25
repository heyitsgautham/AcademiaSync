const { requireSecret } = require('../src/config/secrets');

const withEnv = (overrides, fn) => {
    const saved = { ...process.env };
    Object.assign(process.env, overrides);
    for (const [key, value] of Object.entries(overrides)) {
        if (value === undefined) delete process.env[key];
    }
    try {
        return fn();
    } finally {
        process.env = saved;
    }
};

const loadJwtUtils = () => {
    let utils;
    jest.isolateModules(() => {
        utils = require('../src/utils/jwt');
    });
    return utils;
};

describe('requireSecret', () => {
    it('returns the value when it is set', () => {
        expect(requireSecret('X', { X: 's3cret' })).toBe('s3cret');
    });

    it.each([[undefined], [''], ['   ']])('throws when the value is %p', (value) => {
        expect(() => requireSecret('X', { X: value })).toThrow('X is not set');
    });
});

describe('jwt utils startup', () => {
    it('refuses to load without JWT_SECRET instead of signing with a built-in key', () => {
        withEnv({ JWT_SECRET: undefined }, () => {
            expect(loadJwtUtils).toThrow('JWT_SECRET is not set');
        });
    });

    it('refuses to load without JWT_REFRESH_SECRET', () => {
        withEnv({ JWT_REFRESH_SECRET: '' }, () => {
            expect(loadJwtUtils).toThrow('JWT_REFRESH_SECRET is not set');
        });
    });

    it('signs with the configured secret', () => {
        const jwt = require('jsonwebtoken');
        withEnv({ JWT_SECRET: 'configured-secret' }, () => {
            const token = loadJwtUtils().generateAccessToken({ id: 1, email: 'a@example.com', role: 'Student' });
            expect(jwt.verify(token, 'configured-secret')).toMatchObject({ id: 1 });
        });
    });
});
