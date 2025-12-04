const request = require('supertest');
const app = require('../src/app');

describe('API v1 Modules', () => {
  const modules = ['health', 'ci', 'calendar', 'gallery', 'legend'];

  it('GET /api/v1 → returns list of modules', async () => {
    const response = await request(app).get('/api/v1');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.module).toBe('v1');
    expect(response.body.data.availableModules).toEqual(expect.arrayContaining(modules));
    expect(response.body).toHaveProperty('timestamp');
  });

  modules.forEach(moduleName => {
    it(`GET /api/v1/${moduleName} → returns standard response`, async () => {
      const response = await request(app).get(`/api/v1/${moduleName}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.module).toBe(moduleName);
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('data');
    });
  });
});
