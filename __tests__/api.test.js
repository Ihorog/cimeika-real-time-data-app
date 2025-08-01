const request = require('supertest');
const app = require('../src/app');

describe('Cimeika API', () => {
  let createdComponentId;
  let dataId;

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

  it('chat completion without prompt returns 400', async () => {
    const res = await request(app)
      .post('/chat/completion')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
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

  it('weather endpoint returns city in message', async () => {
    const res = await request(app).get('/weather/current?city=Kyiv');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Kyiv/);
  });

  it('astrology forecast returns sign in message', async () => {
    const res = await request(app).get('/astrology/forecast?sign=aries');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/aries/i);
  });

  it('data weather endpoint returns city in message', async () => {
    const res = await request(app).get('/data/weather?city=Lviv');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Lviv/);
  });

  it('data astrology endpoint returns sign in message', async () => {
    const res = await request(app).get('/data/astrology?sign=taurus');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/taurus/i);
  });

  it('serves openapi spec', async () => {
    const res = await request(app).get('/openapi');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/openapi:\s*3/);
  });
});
