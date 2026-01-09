const fs = require('fs/promises');
const request = require('supertest');

const app = require('../src/app');
const { DATA_FILE, ensureDataFile } = require('../src/routes/api/v1/utils/senseStorage');

describe('Insight module', () => {
  beforeEach(async () => {
    await ensureDataFile();
    await fs.writeFile(DATA_FILE, '[]');
  });

  it('summarizes stored sense profiles', async () => {
    const sampleProfiles = [
      {
        signal: { strength: 0.78 },
        resonance: 0.95,
        nodes: [{ axis: 'ПоДія' }],
        receivedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        signal: { strength: 0.9 },
        resonance: 0.83,
        nodes: [{ axis: 'Настрій' }],
        receivedAt: '2024-01-02T00:00:00.000Z'
      }
    ];

    await fs.writeFile(DATA_FILE, JSON.stringify(sampleProfiles));

    const response = await request(app).get('/api/v1/insight');

    expect(response.status).toBe(200);
    expect(response.body.module).toBe('insight');
    expect(response.body.data.summary.profilesCached).toBe(sampleProfiles.length);
    expect(response.body.data.summary.averageResonance).toBeCloseTo(0.89, 2);
    expect(response.body.data.summary.resonanceHealth).toBe('stable');
    expect(response.body.data.preview).toHaveLength(2);
  });

  it('guides the user when no profiles are available', async () => {
    const response = await request(app).get('/api/v1/insight');

    expect(response.status).toBe(200);
    expect(response.body.data.summary.profilesCached).toBe(0);
    expect(response.body.data.summary.recommendations[0]).toContain('Запустіть сенсорний міст');
  });
});
