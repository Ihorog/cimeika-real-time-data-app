const fs = require('fs/promises');
const nock = require('nock');
const request = require('supertest');

const app = require('../src/app');
const { DATA_FILE, ensureDataFile, readProfiles } = require('../src/routes/api/v1/utils/senseStorage');

describe('CI sense bridge', () => {
  const senseHost = 'http://localhost:8000';
  const mockPayload = {
    signal: { strength: 0.72, trend: 'steady' },
    nodes: [{ axis: 'ПоДія', polarity: '+', weight: 0.8 }],
    annotations: []
  };

  beforeEach(async () => {
    await ensureDataFile();
    await fs.writeFile(DATA_FILE, '[]');
    nock.cleanAll();
  });

  it('fetches, enriches, and stores sense profiles', async () => {
    nock(senseHost).get('/mitca/sense').reply(200, mockPayload);

    const response = await request(app).get('/api/v1/ci/sense');

    expect(response.status).toBe(200);
    expect(response.body.module).toBe('ci_sense');
    expect(response.body.data.resonance).toBeCloseTo(1 / (1 + Math.abs(0.72 - 0.8)));

    const stored = await readProfiles();
    expect(stored).toHaveLength(1);
    expect(stored[0].signal.strength).toBe(mockPayload.signal.strength);
    expect(stored[0]).toHaveProperty('receivedAt');
  });

  it('returns an error payload when the sense service fails', async () => {
    nock(senseHost).get('/mitca/sense').reply(500, { error: 'down' });

    const response = await request(app).get('/api/v1/ci/sense');

    expect(response.status).toBe(502);
    expect(response.body.status).toBe('error');
    expect(response.body.data.error).toContain('Unable to reach semantic sense service');
  });
});
