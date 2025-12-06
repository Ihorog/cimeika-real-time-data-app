const request = require('supertest');
const config = require('../src/config');
const app = require('../src/app');
const { clearCaches, stopCacheSweep } = require('../src/routes/realtime');

const successResponse = (payload) =>
  Promise.resolve({ ok: true, status: 200, json: async () => payload, text: async () => JSON.stringify(payload) });

beforeAll(() => {
  global.fetch = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch.mockImplementation((url, options = {}) => {
    if (url.includes('goweather')) {
      return successResponse({ description: 'Sunny', temperature: '+20 C' });
    }
    if (url.includes('aztro')) {
      return successResponse({ description: 'Great day ahead' });
    }
    return successResponse({});
  });
  clearCaches();
});

afterAll(() => {
  stopCacheSweep();
});

describe('Realtime route validation', () => {
  it('returns the default city when no query is provided', async () => {
    const response = await request(app).get('/weather/current');

    expect(response.status).toBe(200);
    expect(response.body.city).toBe(config.defaultCity);
    expect(response.body.weather).toBe('Sunny');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('rejects an invalid city parameter', async () => {
    const response = await request(app).get('/weather/current').query({ city: '123!!!' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'invalid city parameter' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects an invalid astrology sign', async () => {
    const response = await request(app).get('/astrology/forecast').query({ sign: 'dragon' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'invalid sign parameter' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('normalizes a valid sign and returns a forecast', async () => {
    const response = await request(app).get('/astrology/forecast').query({ sign: ' Leo ' });

    expect(response.status).toBe(200);
    expect(response.body.sign).toBe('leo');
    expect(response.body.forecast).toBe('Great day ahead');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
