const request = require('supertest');
const { app, pool } = require('../src/index');

describe('User Service Health Check', () => {
    afterAll(() => pool.end());

    it('reports healthy when the database answers', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ status: 'healthy', service: 'user-service', database: 'connected' });
    });

    it('should return service info on root endpoint', async () => {
        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('service', 'User Service');
        expect(response.body).toHaveProperty('version');
    });
});
