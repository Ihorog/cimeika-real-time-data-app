const request = require('supertest');
const app = require('../src/app');
const { MODULES } = require('../src/routes/api/v1/modules');

describe('API v1 routes', () => {
  it('lists available v1 modules from the root', async () => {
    const response = await request(app).get('/api/v1');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.module).toBe('api_v1');
    expect(response.body.payload.modules).toEqual(MODULES);
  });

  it('returns health payload with standard schema', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.module).toBe('health');
    expect(response.body.payload).toHaveProperty('timestamp');
  });

  it.each([
    ['ci', 'message'],
    ['legend', 'message'],
    ['gallery', 'items'],
    ['calendar', 'events']
  ])('returns %s stub response', async (module, payloadKey) => {
    const response = await request(app).get(`/api/v1/${module}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.module).toBe(module);
    expect(response.body.payload).toHaveProperty(payloadKey);
  });
});
