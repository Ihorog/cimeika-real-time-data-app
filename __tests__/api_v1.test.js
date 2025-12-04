const request = require('supertest');
const app = require('../src/app');

describe('API v1 routes', () => {
  it('returns health payload with standard schema', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.module).toBe('ci_api');
    expect(response.body.payload).toHaveProperty('timestamp');
  });

  it('returns ci stub response', async () => {
    const response = await request(app).get('/api/v1/ci');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.module).toBe('ci');
    expect(response.body.payload).toHaveProperty('message');
  });
});
