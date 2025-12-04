const request = require('supertest');
const app = require('../src/app');

describe('API v1 routes', () => {
  it('lists available v1 modules from the root', async () => {
    const response = await request(app).get('/api/v1');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.module).toBe('api_v1');
    expect(response.body.payload.modules).toEqual(
      expect.arrayContaining(['ci', 'legend', 'gallery', 'calendar', 'health'])
    );
  });

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

  it('returns legend stub response', async () => {
    const response = await request(app).get('/api/v1/legend');

    expect(response.status).toBe(200);
    expect(response.body.module).toBe('legend');
    expect(response.body.payload).toHaveProperty('message');
  });

  it('returns gallery stub response', async () => {
    const response = await request(app).get('/api/v1/gallery');

    expect(response.status).toBe(200);
    expect(response.body.module).toBe('gallery');
    expect(response.body.payload).toHaveProperty('items');
  });

  it('returns calendar stub response', async () => {
    const response = await request(app).get('/api/v1/calendar');

    expect(response.status).toBe(200);
    expect(response.body.module).toBe('calendar');
    expect(response.body.payload).toHaveProperty('events');
  });
});
