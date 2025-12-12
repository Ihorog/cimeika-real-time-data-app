const request = require('supertest');
const app = require('../src/app');

describe('System Monitor API', () => {
  it('GET /api/v1/system/monitor → returns live system data', async () => {
    const res = await request(app).get('/api/v1/system/monitor');
    expect(res.statusCode).toBe(200);
    expect(res.body.module).toBe('system_monitor');
    expect(res.body.data).toHaveProperty('avgResonance');
    expect(res.body.data).toHaveProperty('api');
    expect(res.body.data).toHaveProperty('modules');
  });
});
