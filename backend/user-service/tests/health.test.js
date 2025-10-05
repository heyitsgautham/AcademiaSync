const request = require('supertest');
const { app, pool } = require('../src/index');
const { cleanupRateLimiter } = require('../src/middleware/rate-limiter');

describe('User Service Health Check', () => {
  afterAll(async () => {
    // Close database connection pool
    if (pool) {
      await pool.end();
    }
    
    // Cleanup rate limiter interval
    cleanupRateLimiter();
  });

  it('should return service health status on /health endpoint', async () => {
    const response = await request(app).get('/health');

    // Accept either 200 (connected) or 503 (disconnected) as valid responses in test
    expect([200, 503]).toContain(response.status);
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
