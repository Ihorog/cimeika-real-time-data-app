jest.mock('../src/routes/api/v1/system', () => {
  const express = require('express');
  const router = express.Router();
  const mockGenerateMonitorData = jest.fn().mockResolvedValue({
    hostname: 'test-host',
    uptime: 42,
    api: { status: 'online', responseTimeMs: 3.14 },
    avgResonance: 0.91,
    modules: ['health'],
    profiles: [],
    timestamp: '2024-01-01T00:00:00.000Z'
  });

  router.generateMonitorData = mockGenerateMonitorData;
  return router;
});

const request = require('supertest');
const config = require('../src/config');
const app = require('../src/app');
const realtimeRouter = require('../src/routes/realtime');
const systemModule = require('../src/routes/api/v1/system');

const mockSystemData = {
  hostname: 'test-host',
  uptime: 42,
  api: { status: 'online', responseTimeMs: 3.14 },
  avgResonance: 0.91,
  modules: ['health'],
  profiles: [],
  timestamp: '2024-01-01T00:00:00.000Z'
};

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
      return successResponse({ description: 'Bright future' });
    }
    return successResponse({});
  });
  realtimeRouter.clearCaches();
  systemModule.generateMonitorData.mockResolvedValue(mockSystemData);
});

afterAll(() => {
  realtimeRouter.stopCacheSweep();
});

describe('Realtime summary aggregator', () => {
  it('returns aggregated realtime data with defaults', async () => {
    const res = await request(app).get('/api/v1/realtime/summary');

    expect(res.statusCode).toBe(200);
    expect(res.body.module).toBe('realtime_summary');
    expect(res.body.data.weather).toEqual({
      city: config.defaultCity,
      weather: 'Sunny',
      temperature: 20
    });
    expect(res.body.data.astrology).toEqual({ sign: config.defaultSign, forecast: 'Bright future' });
    expect(res.body.data.system).toEqual(mockSystemData);
    expect(res.body.data).toHaveProperty('timestamp');
  });

  it('passes through explicit city/sign params and calls upstream services', async () => {
    const res = await request(app)
      .get('/api/v1/realtime/summary')
      .query({ city: 'Kyiv', sign: 'leo' });

    expect(res.statusCode).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith('https://goweather.herokuapp.com/weather/Kyiv', expect.any(Object));
    expect(global.fetch).toHaveBeenCalledWith(
      'https://aztro.sameerkumar.website/?sign=leo&day=today',
      expect.objectContaining({ method: 'POST' })
    );
    expect(systemModule.generateMonitorData).toHaveBeenCalledTimes(1);
    expect(res.body.data.weather.city).toBe('Kyiv');
    expect(res.body.data.astrology.sign).toBe('leo');
  });

  it('validates incoming query parameters', async () => {
    const res = await request(app).get('/api/v1/realtime/summary').query({ city: '1234', sign: 'dragon' });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.data.error).toMatch(/invalid (city|sign) parameter/);
  });

  it('returns service unavailable when aggregation fails', async () => {
    systemModule.generateMonitorData.mockRejectedValueOnce(new Error('system offline'));

    const res = await request(app).get('/api/v1/realtime/summary');

    expect(res.statusCode).toBe(503);
    expect(res.body.status).toBe('error');
    expect(res.body.data.error).toBe('summary service unavailable');
  });
});
