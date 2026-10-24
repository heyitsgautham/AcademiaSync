const request = require('supertest');
const { app, pool } = require('../src/index');
const { createFixtures, authHeader } = require('./helpers/fixtures');

const db = createFixtures(pool);

describe('error handling and request logging', () => {
    let student;
    let admin;

    beforeEach(async () => {
        await db.resetDatabase();
        student = await db.createUser('Student');
        admin = await db.createUser('Admin');
    });

    afterEach(() => jest.restoreAllMocks());
    afterAll(() => pool.end());

    it('answers malformed JSON with 400 instead of 500', async () => {
        const res = await request(app)
            .put('/api/users/profile')
            .set(authHeader(student))
            .set('Content-Type', 'application/json')
            .send('{"courseId": ');

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Request body is not valid JSON');
    });

    it('answers an unknown route with a JSON 404', async () => {
        const res = await request(app).get('/api/nowhere');
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Not found', message: 'No route for GET /api/nowhere' });
    });

    it('keeps database error text out of 500 responses', async () => {
        jest.spyOn(pool, 'query').mockRejectedValueOnce(new Error('relation "courses" does not exist'));

        const res = await request(app).get('/admin/stats').set(authHeader(admin));

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Failed to fetch statistics' });
    });

    it('reports 503 without the driver message when the database is down', async () => {
        jest.spyOn(pool, 'query').mockRejectedValueOnce(new Error('password authentication failed'));

        const res = await request(app).get('/health');

        expect(res.status).toBe(503);
        expect(res.body).toMatchObject({ status: 'unhealthy', database: 'disconnected' });
        expect(JSON.stringify(res.body)).not.toContain('password');
    });

    it('echoes an incoming X-Request-Id and creates one otherwise', async () => {
        const traced = await request(app).get('/').set('X-Request-Id', 'trace-123');
        expect(traced.headers['x-request-id']).toBe('trace-123');

        const fresh = await request(app).get('/');
        expect(fresh.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    });
});
