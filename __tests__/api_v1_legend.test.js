const request = require('supertest');
const app = require('../src/app');
const legendRouter = require('../src/routes/api/v1/legend');

describe('Legend Ci module', () => {
  it('exposes overview with core, flow, and resources', async () => {
    const res = await request(app).get('/api/v1/legend');

    expect(res.statusCode).toBe(200);
    expect(res.body.module).toBe('legend');
    expect(res.body.data.resources).toMatchObject({
      tree: '/api/v1/legend/tree',
      stream: '/api/v1/legend/stream',
      manifest: '/api/v1/legend/manifest',
      sources: '/api/v1/legend/sources',
      log: '/api/v1/legend/log'
    });
    expect(res.body.data.core.root).toBe('Origin_Ci');
    expect(res.body.data.flowPreview.length).toBeGreaterThan(0);
    expect(res.body.data.manifestPreview.length).toBeGreaterThan(0);
    expect(res.body.data.logTail.length).toBeGreaterThan(0);
  });

  it('returns the legend tree with ordered phases', async () => {
    const res = await request(app).get('/api/v1/legend/tree');

    expect(res.statusCode).toBe(200);
    expect(res.body.module).toBe('legend_tree');
    const phases = legendRouter.orderPhases(res.body.data.tree.branches);
    expect(phases[0].id).toBe('silence');
    expect(phases[phases.length - 1].id).toBe('legend_propagation');
  });

  it('returns the genesis stream with chapters', async () => {
    const res = await request(app).get('/api/v1/legend/stream');

    expect(res.statusCode).toBe(200);
    expect(res.body.module).toBe('legend_stream');
    expect(res.body.data.stream.name).toBe('Genesis_Flow');
    expect(res.body.data.stream.chapters).toHaveLength(4);
  });

  it('serves the legend manifest text', async () => {
    const res = await request(app).get('/api/v1/legend/manifest');

    expect(res.statusCode).toBe(200);
    expect(res.body.module).toBe('legend_manifest');
    expect(res.body.data.manifest).toContain('Legend Ci');
  });

  it('provides legend sources and log entries', async () => {
    const sourcesResponse = await request(app).get('/api/v1/legend/sources');
    const logResponse = await request(app).get('/api/v1/legend/log');

    expect(sourcesResponse.statusCode).toBe(200);
    expect(sourcesResponse.body.module).toBe('legend_sources');
    expect(sourcesResponse.body.data.files).toContain('LegendCi_scenario.md');
    expect(sourcesResponse.body.data.scenario).toContain('Тиша');

    expect(logResponse.statusCode).toBe(200);
    expect(logResponse.body.module).toBe('legend_log');
    expect(logResponse.body.data.entries.length).toBeGreaterThan(0);
  });
});
