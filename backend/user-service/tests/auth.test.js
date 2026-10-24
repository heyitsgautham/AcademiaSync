const mockVerifyIdToken = jest.fn();
jest.mock('google-auth-library', () => ({
    OAuth2Client: jest.fn().mockImplementation(() => ({ verifyIdToken: mockVerifyIdToken })),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app, pool } = require('../src/index');
const { createFixtures } = require('./helpers/fixtures');

const db = createFixtures(pool);

const googleProfile = (overrides = {}) => ({
    sub: 'google-123',
    email: 'new.student@example.com',
    given_name: 'New',
    family_name: 'Student',
    picture: 'https://lh3.googleusercontent.com/a/photo',
    ...overrides,
});

const acceptGoogleToken = (profile) => {
    mockVerifyIdToken.mockResolvedValue({ getPayload: () => profile });
};

const cookieValue = (res, name) => {
    const cookie = (res.headers['set-cookie'] || []).find((c) => c.startsWith(`${name}=`));
    return cookie ? cookie.split(';')[0].slice(name.length + 1) : undefined;
};

describe('auth routes', () => {
    beforeEach(async () => {
        await db.resetDatabase();
        mockVerifyIdToken.mockReset();
    });

    afterAll(() => pool.end());

    describe('POST /auth/google', () => {
        it('requires an id token', async () => {
            const res = await request(app).post('/auth/google').send({});
            expect(res.status).toBe(400);
            expect(mockVerifyIdToken).not.toHaveBeenCalled();
        });

        it('rejects a token Google does not accept', async () => {
            mockVerifyIdToken.mockRejectedValue(new Error('Wrong recipient'));
            const res = await request(app).post('/auth/google').send({ idToken: 'forged' });
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid Google token');
        });

        it('verifies the token against the configured client id', async () => {
            acceptGoogleToken(googleProfile());
            await request(app).post('/auth/google').send({ idToken: 'good' });
            expect(mockVerifyIdToken).toHaveBeenCalledWith({
                idToken: 'good',
                audience: process.env.GOOGLE_CLIENT_ID,
            });
        });

        it('creates a student on first sign-in and sets both token cookies', async () => {
            acceptGoogleToken(googleProfile());

            const res = await request(app).post('/auth/google').send({ idToken: 'good' });

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                role: 'Student',
                user: { email: 'new.student@example.com', firstName: 'New', lastName: 'Student' },
            });

            const access = jwt.verify(cookieValue(res, 'accessToken'), process.env.JWT_SECRET);
            expect(access).toMatchObject({ email: 'new.student@example.com', role: 'Student' });

            const refresh = cookieValue(res, 'refreshToken');
            const { rows } = await pool.query('SELECT token FROM refresh_tokens WHERE user_id = $1', [access.id]);
            expect(rows).toEqual([{ token: refresh }]);
            expect(res.headers['set-cookie'].join(';')).toContain('HttpOnly');
        });

        it('signs an existing user in with their stored role and links the Google id', async () => {
            const teacher = await db.createUser('Teacher', { email: 'teacher@example.com' });
            acceptGoogleToken(googleProfile({ email: 'teacher@example.com', sub: 'google-teacher' }));

            const res = await request(app).post('/auth/google').send({ idToken: 'good' });

            expect(res.status).toBe(200);
            expect(res.body.role).toBe('Teacher');
            const { rows } = await pool.query('SELECT google_id, profile_picture FROM users WHERE id = $1', [
                teacher.id,
            ]);
            expect(rows[0]).toEqual({
                google_id: 'google-teacher',
                profile_picture: 'https://lh3.googleusercontent.com/a/photo',
            });
        });
    });

    describe('ADMIN_EMAILS bootstrap', () => {
        afterEach(() => {
            delete process.env.ADMIN_EMAILS;
        });

        it('creates a listed account as an admin on first sign-in', async () => {
            process.env.ADMIN_EMAILS = 'someone@example.com, New.Student@Example.com';
            acceptGoogleToken(googleProfile());

            const res = await request(app).post('/auth/google').send({ idToken: 'good' });

            expect(res.status).toBe(200);
            expect(res.body.role).toBe('Admin');
        });

        it('promotes an existing listed account on its next sign-in', async () => {
            const existing = await db.createUser('Student', { email: 'new.student@example.com' });
            process.env.ADMIN_EMAILS = 'new.student@example.com';
            acceptGoogleToken(googleProfile());

            const res = await request(app).post('/auth/google').send({ idToken: 'good' });

            expect(res.body.role).toBe('Admin');
            const { rows } = await pool.query('SELECT role FROM users WHERE id = $1', [existing.id]);
            expect(rows[0].role).toBe('Admin');
            const access = jwt.verify(cookieValue(res, 'accessToken'), process.env.JWT_SECRET);
            expect(access.role).toBe('Admin');
        });

        it('leaves unlisted accounts as students', async () => {
            process.env.ADMIN_EMAILS = 'someone@example.com';
            acceptGoogleToken(googleProfile());

            const res = await request(app).post('/auth/google').send({ idToken: 'good' });

            expect(res.body.role).toBe('Student');
        });
    });

    describe('signing in twice within one second', () => {
        it('stores two distinct refresh tokens instead of failing on the unique index', async () => {
            acceptGoogleToken(googleProfile());

            const first = await request(app).post('/auth/google').send({ idToken: 'good' });
            const second = await request(app).post('/auth/google').send({ idToken: 'good' });

            expect(first.status).toBe(200);
            expect(second.status).toBe(200);
            expect(cookieValue(first, 'refreshToken')).not.toBe(cookieValue(second, 'refreshToken'));
            const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM refresh_tokens');
            expect(rows[0].n).toBe(2);
        });
    });

    describe('POST /auth/refresh', () => {
        const signIn = async () => {
            acceptGoogleToken(googleProfile());
            const res = await request(app).post('/auth/google').send({ idToken: 'good' });
            return cookieValue(res, 'refreshToken');
        };

        it('requires the refresh cookie', async () => {
            const res = await request(app).post('/auth/refresh');
            expect(res.status).toBe(401);
        });

        it('rejects a token signed with the wrong secret', async () => {
            const forged = jwt.sign({ id: 1 }, 'not-the-secret');
            const res = await request(app).post('/auth/refresh').set('Cookie', `refreshToken=${forged}`);
            expect(res.status).toBe(401);
        });

        it('issues a new access token for a stored refresh token', async () => {
            const refresh = await signIn();

            const res = await request(app).post('/auth/refresh').set('Cookie', `refreshToken=${refresh}`);

            expect(res.status).toBe(200);
            expect(cookieValue(res, 'accessToken')).toBeDefined();
        });

        it('rejects a valid token that was revoked by logout', async () => {
            const refresh = await signIn();
            await request(app).post('/auth/logout').set('Cookie', `refreshToken=${refresh}`);

            const res = await request(app).post('/auth/refresh').set('Cookie', `refreshToken=${refresh}`);

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Refresh token not found in database');
        });

        it('deletes and rejects a stored token past its expiry', async () => {
            const refresh = await signIn();
            await pool.query("UPDATE refresh_tokens SET expires_at = NOW() - INTERVAL '1 minute'");

            const res = await request(app).post('/auth/refresh').set('Cookie', `refreshToken=${refresh}`);

            expect(res.status).toBe(401);
            const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM refresh_tokens');
            expect(rows[0].n).toBe(0);
        });
    });

    describe('POST /auth/logout', () => {
        it('clears both cookies even without a session', async () => {
            const res = await request(app).post('/auth/logout');
            expect(res.status).toBe(200);
            expect(res.headers['set-cookie'].join(';')).toMatch(/accessToken=;.*refreshToken=;/);
        });
    });
});
