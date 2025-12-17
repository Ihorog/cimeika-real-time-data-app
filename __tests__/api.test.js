const request = require('supertest');
const app = require('../server');
process.env.HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN || 'test-token';

const request = require('supertest');
jest.mock('../src/routes/huggingface');
const app = require('../src/app');
const nock = require('nock');
const { stopCacheSweep } = require('../src/routes/realtime');
const defaultCity = process.env.DEFAULT_CITY || 'London';
const defaultSign = process.env.DEFAULT_SIGN || 'aries';

describe('Cimeika API', () => {
  let createdComponentId;
  let dataId;

  beforeAll(() => {
    nock('https://goweather.herokuapp.com')
      .persist()
      .get(/\/weather\/.*$/)
      .reply(200, { temperature: '+20 °C', description: 'Clear' });
    nock('https://aztro.sameerkumar.website')
      .persist()
      .post(/.*/)
      .reply(200, { description: 'Great day ahead' });
  });

  afterAll(() => {
    stopCacheSweep();
    nock.cleanAll();
  });

  it('auth login', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'user', password: 'pass' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('chat completion', async () => {
    const res = await request(app)
      .post('/chat/completion')
      .send({ prompt: 'Hello' });
    expect(res.status).toBe(200);
    expect(res.body.choices).toBeDefined();
  });

  it('get config', async () => {
    const res = await request(app).get('/config');
    expect(res.status).toBe(200);
    expect(res.body.weatherEndpoint).toBeDefined();
    expect(res.body.astrologyEndpoint).toBeDefined();
  });

  it('huggingface completion', async () => {
    const res = await request(app)
      .post('/ai/huggingface/completion')
      .send({ prompt: 'Hello' });
    expect(res.status).toBe(200);
    expect(res.body.choices).toBeDefined();
  });

  it('huggingface completion with custom model', async () => {
    const res = await request(app)
      .post('/ai/huggingface/completion')
      .send({ prompt: 'Hello', model: 'microsoft/DialoGPT-medium' });
    expect(res.status).toBe(200);
    expect(res.body.choices).toBeDefined();
    // When no token is set, it returns mock response
    expect(res.body.model).toBe('mock-hf');
  });

  it('huggingface completion without prompt returns 400', async () => {
    const res = await request(app)
      .post('/ai/huggingface/completion')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('prompt required');
  });

  it('get huggingface models', async () => {
    const res = await request(app).get('/ai/huggingface/models');
    expect(res.status).toBe(200);
    expect(res.body.models).toBeDefined();
    expect(Array.isArray(res.body.models)).toBe(true);
    expect(res.body.total).toBeDefined();
    expect(res.body.models.length).toBeGreaterThan(0);
  });

  it('chat completion without prompt returns 400', async () => {
    const res = await request(app)
      .post('/chat/completion')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    // Optionally check for a specific error message:
    // expect(res.body.error).toBe('prompt required');
  });

  it('huggingface completion with token returns 200', async () => {
    const original = process.env.HUGGINGFACE_TOKEN;
    process.env.HUGGINGFACE_TOKEN = 'test-token';

    const proxyVars = [
      'HTTP_PROXY',
      'http_proxy',
      'HTTPS_PROXY',
      'https_proxy',
      'npm_config_http_proxy',
      'npm_config_https_proxy'
    ];
    const proxyBackup = {};
    proxyVars.forEach(v => {
      proxyBackup[v] = process.env[v];
      delete process.env[v];
    });

    const express = require('express');
    const requireHfToken = require('../src/middleware/requireHfToken');
    const hfRoute = jest.requireActual('../src/routes/huggingface');
    const testApp = express();
    testApp.use(express.json());
    testApp.post('/ai/huggingface/completion', requireHfToken, hfRoute);

    nock('https://api-inference.huggingface.co')
      .post('/models/gpt2')
      .reply(200, { generated_text: 'mocked' });

    const res = await request(testApp)
      .post('/ai/huggingface/completion')
      .send({ prompt: 'Hello' });

    expect(res.status).toBe(200);
    expect(res.body.choices[0].text).toBe('mocked');

    if (original) process.env.HUGGINGFACE_TOKEN = original;
    else delete process.env.HUGGINGFACE_TOKEN;
    proxyVars.forEach(v => {
      if (proxyBackup[v] !== undefined) process.env[v] = proxyBackup[v];
      else delete process.env[v];
    });
  });

  it('weather endpoint returns 503 when api key missing', async () => {
    const originalKey = process.env.OPENWEATHER_KEY;
    delete process.env.OPENWEATHER_KEY;
    const res = await request(app).get('/weather/current');
    expect(res.status).toBe(503);
    expect(res.body.error).toMatch(/key not configured/i);
    process.env.OPENWEATHER_KEY = originalKey;
  });

  it('astrology endpoint returns 503 when api key missing', async () => {
    const originalKey = process.env.ASTROLOGY_KEY;
    delete process.env.ASTROLOGY_KEY;
    const res = await request(app).get('/astrology/forecast');
    expect(res.status).toBe(503);
    expect(res.body.error).toMatch(/key not configured/i);
    process.env.ASTROLOGY_KEY = originalKey;
  });

  it('hf-space proxy completion', async () => {
    const proxyVars = [
      'HTTP_PROXY',
      'http_proxy',
      'HTTPS_PROXY',
      'https_proxy',
      'npm_config_http_proxy',
      'npm_config_https_proxy'
    ];
    const proxyBackup = {};
    proxyVars.forEach(v => {
      proxyBackup[v] = process.env[v];
      delete process.env[v];
    });

    nock('https://ihorog-cimeika-api.hf.space')
      .post('/chat/completion')
      .reply(200, { choices: [{ text: 'space-response' }] });

    const res = await request(app)
      .post('/ai/hf-space/completion')
      .send({ prompt: 'Test space' });

    expect(res.status).toBe(200);
    expect(res.body.choices[0].text).toBe('space-response');

    proxyVars.forEach(v => {
      if (proxyBackup[v] !== undefined) process.env[v] = proxyBackup[v];
      else delete process.env[v];
    });
  });

  it('create component without name returns 400', async () => {
    const res = await request(app)
      .post('/components')
      .send({ type: 'basic' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/"name"/);
  });

  it('create component with empty type returns 400', async () => {
    const res = await request(app)
      .post('/components')
      .send({ name: 'comp' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/"type"/);
  });

  it('create component with unknown field returns 400', async () => {
    const res = await request(app)
      .post('/components')
      .send({ name: 'comp', type: 'basic', extra: 'nope' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/"extra"/);
  });

  it('create component with wrong type returns 400', async () => {
    const res = await request(app)
      .post('/components')
      .send({ name: 'comp', type: 123 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/type/);
  });

  it('create component with non-object attribute returns 400', async () => {
    const res = await request(app)
      .post('/components')
      .send({ name: 'comp', type: 'basic', attributes: ['oops'] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/attributes/);
  });

  it('create component with attribute missing key returns 400', async () => {
    const res = await request(app)
      .post('/components')
      .send({ name: 'comp', type: 'basic', attributes: [{ value: 'v' }] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/key/);
  });

  it('create component with attribute invalid value returns 400', async () => {
    const res = await request(app)
      .post('/components')
      .send({ name: 'comp', type: 'basic', attributes: [{ key: 'k', value: { nope: true } }] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/value/);
  });

  it('create component', async () => {
    const res = await request(app)
      .post('/components')
      .send({ name: 'comp1', type: 'basic' });
    expect(res.status).toBe(201);
    createdComponentId = res.body.id;
    expect(createdComponentId).toBeDefined();
  });

  it('get component', async () => {
    const res = await request(app)
      .get(`/components/${createdComponentId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdComponentId);
  });

  it('update component with empty name returns 400', async () => {
    const res = await request(app)
      .put(`/components/${createdComponentId}`)
      .send({ name: '', type: 'basic' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/"name"/);
  });

  it('update component without type returns 400', async () => {
    const res = await request(app)
      .put(`/components/${createdComponentId}`)
      .send({ name: 'comp1' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/"type"/);
  });

  it('update component with unknown field returns 400', async () => {
    const res = await request(app)
      .put(`/components/${createdComponentId}`)
      .send({ name: 'comp1', type: 'basic', extra: 'nope' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/"extra"/);
  });

  it('update component with wrong type returns 400', async () => {
    const res = await request(app)
      .put(`/components/${createdComponentId}`)
      .send({ name: 'comp1', type: 123 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/type/);
  });

  it('update component', async () => {
    const res = await request(app)
      .put(`/components/${createdComponentId}`)
      .send({ name: 'comp1-upd', type: 'basic' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('comp1-upd');
  });

  it('link component', async () => {
    const res = await request(app)
      .post(`/components/${createdComponentId}/link`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('linked');
  });

  it('link non-existent component returns 404', async () => {
    const res = await request(app)
      .post('/components/bad-id/link');
    expect(res.status).toBe(404);
  });

  it('unlink component', async () => {
    const res = await request(app)
      .post(`/components/${createdComponentId}/unlink`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('unlinked');
  });

  it('unlink non-existent component returns 404', async () => {
    const res = await request(app)
      .post('/components/bad-id/unlink');
    expect(res.status).toBe(404);
  });

  it('get component attributes', async () => {
    const res = await request(app)
      .get(`/components/${createdComponentId}/attributes`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('attributes for non-existent component returns 404', async () => {
    const res = await request(app)
      .get('/components/bad-id/attributes');
    expect(res.status).toBe(404);
  });

  it('delete component', async () => {
    const res = await request(app)
      .delete(`/components/${createdComponentId}`);
    expect(res.status).toBe(204);
  });

  it('data collect without dataSource returns 400', async () => {
    const res = await request(app)
      .post('/data/collect')
      .send({ data: { foo: 1 } });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('data log without dataId returns 400', async () => {
    const res = await request(app)
      .post('/data/log')
      .send({ logDetails: {} });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('data collect', async () => {
    const res = await request(app)
      .post('/data/collect')
      .send({ dataSource: 'API', data: {a:1} });
    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
    dataId = res.body.id;
  });

  it('data log', async () => {
    const res = await request(app)
      .post('/data/log')
      .send({ dataId, logDetails: {} });
    expect(res.status).toBe(200);
  });

  it('data analyze', async () => {
    const res = await request(app)
      .post('/data/analyze')
      .send({ dataId });
    expect(res.status).toBe(200);
    expect(res.body.analysis).toBeDefined();
  });

  it('data save', async () => {
    const res = await request(app)
      .post('/data/save')
      .send({ dataId, storageDetails: {} });
    expect(res.status).toBe(200);
  });

  it('data transfer', async () => {
    const res = await request(app)
      .post('/data/transfer')
      .send({ dataId, destination: 'external', transferDetails: {} });
    expect(res.status).toBe(200);
  });

  it('data predict', async () => {
    const res = await request(app)
      .post('/data/predict')
      .send({ dataId, modelId: 'm1', predictionParameters: {} });
    expect(res.status).toBe(200);
    expect(res.body.prediction).toBeDefined();
  });

  it('weather endpoint returns structured data', async () => {
    const res = await request(app).get('/weather/current?city=Kyiv');
    expect(res.status).toBe(200);
    expect(res.body.city).toBe('Kyiv');
    expect(typeof res.body.weather).toBe('string');
    expect(typeof res.body.temperature).toBe('number');
  });

  it('weather endpoint uses default city when not provided', async () => {
    const res = await request(app).get('/weather/current');
    expect(res.status).toBe(200);
    expect(res.body.city).toBe(defaultCity);
  });

  it('astrology forecast returns structured data', async () => {
    const res = await request(app).get('/astrology/forecast?sign=taurus');
    expect(res.status).toBe(200);
    expect(res.body.sign).toBe('taurus');
    expect(typeof res.body.forecast).toBe('string');
  });

  it('astrology forecast uses default sign when not provided', async () => {
    const res = await request(app).get('/astrology/forecast');
    expect(res.status).toBe(200);
    expect(res.body.sign).toBe(defaultSign);
  });

  it('data weather endpoint returns structured data', async () => {
    const res = await request(app).get('/data/weather?city=Lviv');
    expect(res.status).toBe(200);
    expect(res.body.city).toBe('Lviv');
    expect(typeof res.body.weather).toBe('string');
    expect(typeof res.body.temperature).toBe('number');
  });

  it('data weather endpoint uses default city when not provided', async () => {
    const res = await request(app).get('/data/weather');
    expect(res.status).toBe(200);
    expect(res.body.city).toBe(defaultCity);
  });

  it('data astrology endpoint returns structured data', async () => {
    const res = await request(app).get('/data/astrology?sign=taurus');
    expect(res.status).toBe(200);
    expect(res.body.sign).toBe('taurus');
    expect(typeof res.body.forecast).toBe('string');
  });

  it('data astrology endpoint uses default sign when not provided', async () => {
    const res = await request(app).get('/data/astrology');
    expect(res.status).toBe(200);
    expect(res.body.sign).toBe(defaultSign);
  });

  it('returns config with default endpoints', async () => {
    const res = await request(app).get('/config');
    expect(res.status).toBe(200);
    expect(res.body.weatherEndpoint).toBe('/weather/current');
    expect(res.body.astrologyEndpoint).toBe('/astrology/forecast');
    expect(res.body.defaultCity).toBe(defaultCity);
    expect(res.body.defaultSign).toBe(defaultSign);
  });

  it('config exposes weather and astrology endpoints', async () => {
    const res = await request(app).get('/config');
    expect(res.status).toBe(200);
    expect(typeof res.body.weatherEndpoint).toBe('string');
    expect(typeof res.body.astrologyEndpoint).toBe('string');
  });

  it('serves openapi spec', async () => {
    const res = await request(app).get('/openapi');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/openapi:\s*3/);
  });
});
