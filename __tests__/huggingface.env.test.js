process.env.WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'weather-test';
process.env.ASTROLOGY_API_KEY = process.env.ASTROLOGY_API_KEY || 'astro-test';

delete process.env.HUGGINGFACE_TOKEN;

const request = require('supertest');

describe('Hugging Face completion without token', () => {
  let app;
  beforeAll(() => {
    jest.resetModules();
    app = require('../src/app');
  });

  it('returns 503 when HUGGINGFACE_TOKEN not configured', async () => {
    const res = await request(app)
      .post('/ai/huggingface/completion')
      .send({ prompt: 'Hello' });
    expect(res.status).toBe(503);
    expect(res.body.error).toBe('HUGGINGFACE_TOKEN not configured');
  });
});
