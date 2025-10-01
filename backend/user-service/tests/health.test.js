const request = require('supertest');
const app = require('../src/index');

describe('User Service Health Check', () => {
  it('should return healthy status on /health endpoint', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('service', 'user-service');
  });

  it('should return service info on root endpoint', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('service', 'User Service');
    expect(response.body).toHaveProperty('version');
  });
});
