const request = require('supertest');
const app = require('../server');

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

  it('delete component', async () => {
    const res = await request(app)
      .delete(`/components/${createdComponentId}`);
    expect(res.status).toBe(204);
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

  it('serves openapi spec', async () => {
    const res = await request(app).get('/openapi');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/openapi:\s*3/);
  });
});
