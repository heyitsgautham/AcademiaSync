const mockVerifyIdToken = jest.fn();
jest.mock('google-auth-library', () => ({
    OAuth2Client: jest.fn().mockImplementation(() => ({ verifyIdToken: mockVerifyIdToken })),
}));

const request = require('supertest');
const { app, pool } = require('../src/index');
const { createFixtures, authHeader } = require('./helpers/fixtures');

const db = createFixtures(pool);

describe('request validation', () => {
    let admin;
    let student;

    beforeEach(async () => {
        await db.resetDatabase();
        admin = await db.createUser('Admin');
        student = await db.createUser('Student');
    });

    afterAll(() => pool.end());

    it('rejects a non-string Google id token without calling Google', async () => {
        const res = await request(app).post('/auth/google').send({ idToken: 12345 });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Google ID token is required');
        expect(mockVerifyIdToken).not.toHaveBeenCalled();
    });

    it('rejects a teacher id that is not a number', async () => {
        const res = await request(app)
            .put('/admin/teachers/abc')
            .set(authHeader(admin))
            .send({ firstName: 'a', lastName: 'b', specialization: 'c' });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('id must be a positive integer');
    });

    it('rejects a malformed teacher email', async () => {
        const res = await request(app).post('/admin/teachers').set(authHeader(admin)).send({
            firstName: 'A',
            lastName: 'B',
            email: 'not-an-email',
            specialization: 'X',
            password: 'secret123',
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Email must be a valid address');
    });

    it('rejects a password longer than bcrypt can hash', async () => {
        const res = await request(app)
            .post('/admin/teachers')
            .set(authHeader(admin))
            .send({
                firstName: 'A',
                lastName: 'B',
                email: 'long@example.com',
                specialization: 'X',
                password: 'p'.repeat(73),
            });
        expect(res.status).toBe(400);
    });

    it('rejects a non-numeric userId on promote-role', async () => {
        const res = await request(app)
            .post('/admin/promote-role')
            .set(authHeader(admin))
            .send({ userId: 'me', newRole: 'Admin' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('userId must be a positive integer');
    });

    it('accepts a numeric string age from a form field', async () => {
        const res = await request(app)
            .put('/api/users/profile')
            .set(authHeader(student))
            .send({ first_name: 'Sam', age: '30' });
        expect(res.status).toBe(200);
        expect(res.body.user.age).toBe(30);
    });

    it('rejects an age that is not a number', async () => {
        const res = await request(app)
            .put('/api/users/profile')
            .set(authHeader(student))
            .send({ first_name: 'Sam', age: 'thirty' });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Age must be a number');
    });

    it('rejects a first name longer than the column allows', async () => {
        const res = await request(app)
            .put('/api/users/profile')
            .set(authHeader(student))
            .send({ first_name: 'x'.repeat(101) });
        expect(res.status).toBe(400);
    });
});
