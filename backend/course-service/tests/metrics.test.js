const request = require('supertest');
const { app, pool } = require('../src/index');
const { createApp } = require('../src/app');
const { routeLabel } = require('../src/middleware/metrics');
const { createFixtures, authHeader } = require('./helpers/fixtures');

const db = createFixtures(pool);

afterAll(() => pool.end());

const durationCount = (body, route, status) => {
    const line = body
        .split('\n')
        .find(
            (l) =>
                l.startsWith('http_request_duration_seconds_count{') &&
                l.includes(`route="${route}"`) &&
                l.includes(`status_code="${status}"`)
        );
    return line ? Number(line.split(' ').pop()) : 0;
};

describe('GET /metrics', () => {
    it('serves Prometheus text with process and pool metrics labelled by service', async () => {
        const res = await request(app).get('/metrics');

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/^text\/plain/);
        expect(res.text).toContain('process_cpu_seconds_total{service="course-service"}');
        expect(res.text).toMatch(/db_pool_connections\{state="total",service="course-service"\} \d+/);
    });

    it('records requests under their route pattern, not the raw URL', async () => {
        await db.resetDatabase();
        const admin = await db.createUser('Admin');
        const student = await db.createUser('Student');
        const before = durationCount(
            (await request(app).get('/metrics')).text,
            '/admin/students/:studentId/courses',
            200
        );

        await request(app).get(`/admin/students/${student.id}/courses`).set(authHeader(admin)).expect(200);
        await request(app).get('/no-such-route').expect(404);

        const body = (await request(app).get('/metrics')).text;
        expect(durationCount(body, '/admin/students/:studentId/courses', 200)).toBe(before + 1);
        expect(body).not.toContain(`/admin/students/${student.id}/courses`);
        expect(durationCount(body, 'unmatched', 404)).toBeGreaterThanOrEqual(1);
    });

    it('leaves health checks and scrapes out of the request histogram', async () => {
        await request(app).get('/health');
        const body = (await request(app).get('/metrics')).text;
        expect(body).not.toContain('route="/health"');
        expect(body).not.toContain('route="/metrics"');
    });
});

describe('METRICS_TOKEN', () => {
    let guarded;

    beforeAll(() => {
        process.env.METRICS_TOKEN = 'scrape-token';
        guarded = createApp(pool);
    });

    afterAll(() => {
        delete process.env.METRICS_TOKEN;
    });

    it('rejects a scrape without the token', async () => {
        expect((await request(guarded).get('/metrics')).status).toBe(401);
        expect((await request(guarded).get('/metrics').set('Authorization', 'Bearer wrong-token1')).status).toBe(401);
    });

    it('serves metrics to a scrape with the token', async () => {
        const res = await request(guarded).get('/metrics').set('Authorization', 'Bearer scrape-token');
        expect(res.status).toBe(200);
    });
});

describe('routeLabel', () => {
    it('joins the mount path and the route pattern', () => {
        expect(routeLabel({ baseUrl: '/api/teacher', route: { path: '/assignments/:id' } })).toBe(
            '/api/teacher/assignments/:id'
        );
    });

    it('groups requests no route matched', () => {
        expect(routeLabel({ baseUrl: '', route: undefined })).toBe('unmatched');
    });
});
