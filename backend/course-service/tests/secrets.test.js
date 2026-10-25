const jwt = require('jsonwebtoken');
const request = require('supertest');
const { requireSecret } = require('../src/config/secrets');
const { app, pool } = require('../src/index');

afterAll(() => pool.end());

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

describe('JWT_SECRET', () => {
    it('stops the service from loading when it is missing', () => {
        const saved = process.env.JWT_SECRET;
        delete process.env.JWT_SECRET;
        try {
            expect(loadJwtUtils).toThrow('JWT_SECRET is not set');
        } finally {
            process.env.JWT_SECRET = saved;
        }
    });

    it('rejects a token signed with the old built-in fallback key', async () => {
        const forged = jwt.sign({ id: 1, email: 'a@example.com', role: 'Admin' }, 'your-super-secret-jwt-key');
        const res = await request(app).get('/admin/courses').set('Authorization', `Bearer ${forged}`);
        expect(res.status).toBe(401);
    });
});
