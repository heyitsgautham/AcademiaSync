const mockVerifyIdToken = jest.fn();
jest.mock('google-auth-library', () => ({
    OAuth2Client: jest.fn().mockImplementation(() => ({ verifyIdToken: mockVerifyIdToken })),
}));

const request = require('supertest');
const { pool } = require('../src/index');
const { createApp } = require('../src/app');
const { positiveInt } = require('../src/middleware/rate-limit');
const { createFixtures } = require('./helpers/fixtures');

const db = createFixtures(pool);
const LIMIT = 3;

const acceptGoogleToken = () =>
    mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
            sub: 'google-1',
            email: 'rate.limit@example.com',
            given_name: 'Rate',
            family_name: 'Limit',
        }),
    });
const rejectGoogleToken = () => mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

// Each test builds its own app, so each starts with an empty limiter store
const freshApp = () => {
    process.env.LOGIN_RATE_LIMIT_MAX = String(LIMIT);
    process.env.REFRESH_RATE_LIMIT_MAX = String(LIMIT);
    return createApp(pool);
};

describe('auth rate limiting', () => {
    beforeEach(async () => {
        await db.resetDatabase();
        mockVerifyIdToken.mockReset();
    });

    afterAll(async () => {
        delete process.env.LOGIN_RATE_LIMIT_MAX;
        delete process.env.REFRESH_RATE_LIMIT_MAX;
        await pool.end();
    });

    it(`answers the ${LIMIT + 1}th failed sign-in in the window with 429`, async () => {
        const app = freshApp();
        rejectGoogleToken();

        for (let i = 0; i < LIMIT; i++) {
            const res = await request(app).post('/auth/google').send({ idToken: 'forged' });
            expect(res.status).toBe(401);
        }

        const blocked = await request(app).post('/auth/google').send({ idToken: 'forged' });
        expect(blocked.status).toBe(429);
        expect(blocked.body).toMatchObject({ error: 'Too Many Requests', retryAfter: 900 });
        expect(blocked.headers).toHaveProperty('ratelimit');
    });

    it('blocks even a valid token once the limit is hit, without asking Google', async () => {
        const app = freshApp();
        rejectGoogleToken();
        for (let i = 0; i < LIMIT; i++) await request(app).post('/auth/google').send({ idToken: 'forged' });

        mockVerifyIdToken.mockClear();
        acceptGoogleToken();
        const res = await request(app).post('/auth/google').send({ idToken: 'good' });

        expect(res.status).toBe(429);
        expect(mockVerifyIdToken).not.toHaveBeenCalled();
    });

    it('never throttles successful sign-ins, which all share the Next.js server IP', async () => {
        const app = freshApp();
        acceptGoogleToken();

        for (let i = 0; i < LIMIT * 3; i++) {
            const res = await request(app).post('/auth/google').send({ idToken: 'good' });
            expect(res.status).toBe(200);
        }
    });

    it('still lets a normal sign-in through after a few failures under the limit', async () => {
        const app = freshApp();
        rejectGoogleToken();
        for (let i = 0; i < LIMIT - 1; i++) await request(app).post('/auth/google').send({ idToken: 'typo' });

        acceptGoogleToken();
        const res = await request(app).post('/auth/google').send({ idToken: 'good' });

        expect(res.status).toBe(200);
        expect(res.body.role).toBe('Student');
    });

    it(`answers the ${LIMIT + 1}th failed refresh with 429`, async () => {
        const app = freshApp();

        for (let i = 0; i < LIMIT; i++) {
            const res = await request(app).post('/auth/refresh').set('Cookie', 'refreshToken=guess');
            expect(res.status).toBe(401);
        }

        const blocked = await request(app).post('/auth/refresh').set('Cookie', 'refreshToken=guess');
        expect(blocked.status).toBe(429);
    });

    it('keeps the login and refresh counters separate', async () => {
        const app = freshApp();
        for (let i = 0; i < LIMIT; i++) await request(app).post('/auth/refresh');

        rejectGoogleToken();
        const res = await request(app).post('/auth/google').send({ idToken: 'forged' });

        expect(res.status).toBe(401);
    });
});

describe('rate limit settings', () => {
    it.each([
        ['20', 20],
        [undefined, 10],
        ['0', 10],
        ['-5', 10],
        ['ten', 10],
        ['2.5', 10],
    ])('reads %p as %p', (value, expected) => {
        expect(positiveInt(value, 10)).toBe(expected);
    });
});
