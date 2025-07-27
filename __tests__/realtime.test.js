const request = require('supertest');
const nock = require('nock');
const app = require('../src/app');

describe('Realtime API', () => {
  beforeAll(() => {
    process.env.OPENWEATHER_KEY = 'test';
    process.env.ASTROLOGY_KEY = 'test';
    process.env.http_proxy = '';
    process.env.HTTP_PROXY = '';
    process.env.https_proxy = '';
    process.env.HTTPS_PROXY = '';
    process.env.npm_config_http_proxy = '';
    process.env.npm_config_https_proxy = '';
    process.env.YARN_HTTP_PROXY = '';
    process.env.YARN_HTTPS_PROXY = '';
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('returns current weather from mocked service', async () => {
    nock('https://api.openweathermap.org')
      .get(/.*/)
      .reply(200, { weather: [{ description: 'clear sky' }], main: { temp: 293.15 } });

    const res = await request(app).get('/weather/current?city=London');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ weather: 'clear sky', temperature: 20 });
  });

  it('handles weather service failure', async () => {
    nock('https://api.openweathermap.org')
      .get(/.*/)
      .replyWithError('failed');

    const res = await request(app).get('/weather/current?city=London');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Weather data unavailable');
  });

  it('returns astrology forecast from mocked service', async () => {
    nock('https://api.freeastrologyapi.com')
      .get(/.*/)
      .reply(200, { forecast: 'good day' });

    const res = await request(app).get('/astrology/forecast?sign=aries');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ forecast: 'good day' });
  });

  it('handles astrology service failure', async () => {
    nock('https://api.freeastrologyapi.com')
      .get(/.*/)
      .reply(500);

    const res = await request(app).get('/astrology/forecast?sign=aries');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Astrological data unavailable');
  });

  it('returns 503 when OPENWEATHER_KEY missing', async () => {
    delete process.env.OPENWEATHER_KEY;
    const res = await request(app).get('/weather/current?city=London');
    expect(res.status).toBe(503);
    expect(res.body.error).toBe('service unavailable: missing OPENWEATHER_KEY');
    process.env.OPENWEATHER_KEY = 'test';
  });

  it('returns 503 when ASTROLOGY_KEY missing', async () => {
    delete process.env.ASTROLOGY_KEY;
    const res = await request(app).get('/astrology/forecast?sign=aries');
    expect(res.status).toBe(503);
    expect(res.body.error).toBe('service unavailable: missing ASTROLOGY_KEY');
    process.env.ASTROLOGY_KEY = 'test';
  });

  it('returns stubbed weather data with city parameter', async () => {
    const res = await request(app).get('/data/weather?city=Kyiv');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ city: 'Kyiv', weather: 'clear sky', temperature: 20.5 });
  });

  it('returns 400 if city missing', async () => {
    const res = await request(app).get('/data/weather');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('city required');
  });

  it('returns stubbed astrology data with sign parameter', async () => {
    const res = await request(app).get('/data/astrology?sign=aries');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ sign: 'aries', forecast: 'Today is a good day for new beginnings.' });
  });

  it('returns 400 if sign missing', async () => {
    const res = await request(app).get('/data/astrology');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('sign required');
  });
});
