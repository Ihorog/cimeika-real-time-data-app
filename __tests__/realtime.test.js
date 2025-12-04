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

const request = require('supertest');
const axios = require('axios');
const config = require('../src/config');
const app = require('../src/app');
const { clearCaches, stopCacheSweep } = require('../src/routes/realtime');

beforeEach(() => {
  jest.clearAllMocks();
  axios.get.mockResolvedValue({ data: { description: 'Sunny', temperature: '+20 C' } });
  axios.post.mockResolvedValue({ data: { description: 'Great day ahead' } });
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
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('rejects an invalid city parameter', async () => {
    const response = await request(app).get('/weather/current').query({ city: '123!!!' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'invalid city parameter' });
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('rejects an invalid astrology sign', async () => {
    const response = await request(app).get('/astrology/forecast').query({ sign: 'dragon' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'invalid sign parameter' });
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('normalizes a valid sign and returns a forecast', async () => {
    const response = await request(app).get('/astrology/forecast').query({ sign: ' Leo ' });

    expect(response.status).toBe(200);
    expect(response.body.sign).toBe('leo');
    expect(response.body.forecast).toBe('Great day ahead');
    expect(axios.post).toHaveBeenCalledTimes(1);
  });
});
