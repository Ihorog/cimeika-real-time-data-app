jest.mock('axios', () => {
  const axiosMock = { get: jest.fn(), post: jest.fn() };
  axiosMock.create = jest.fn(() => axiosMock);
  return axiosMock;
});

jest.mock('axios-retry', () => {
  const retryMock = jest.fn();
  retryMock.exponentialDelay = jest.fn(() => 0);
  return retryMock;
});

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
const axios = require('axios');
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

beforeEach(() => {
  jest.clearAllMocks();
  axios.get.mockResolvedValue({ data: { description: 'Sunny', temperature: '+20 C' } });
  axios.post.mockResolvedValue({ data: { description: 'Bright future' } });
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
    expect(axios.get).toHaveBeenCalledWith('https://goweather.herokuapp.com/weather/Kyiv');
    expect(axios.post).toHaveBeenCalledWith(
      'https://aztro.sameerkumar.website/?sign=leo&day=today',
      null
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
