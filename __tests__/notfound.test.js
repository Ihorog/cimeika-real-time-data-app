const request = require('supertest');
const app = require('../src/app');
const { stopCacheSweep } = require('../src/routes/realtime');

describe('unknown route', () => {
  it('returns 404 and error message', async () => {
    const res = await request(app).get('/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'not found' });
  });

  afterAll(() => {
    stopCacheSweep();
  });
});
