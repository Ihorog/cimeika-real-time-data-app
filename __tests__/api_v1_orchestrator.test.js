const fs = require('fs/promises');
const path = require('path');
const request = require('supertest');
const app = require('../src/app');

const ORCHESTRATION_LOG_FILE = path.join(__dirname, '..', 'data', 'orchestration_log.json');

async function resetLogFile() {
  await fs.mkdir(path.dirname(ORCHESTRATION_LOG_FILE), { recursive: true });
  try {
    await fs.unlink(ORCHESTRATION_LOG_FILE);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

describe('Orchestrator Balancing API', () => {
  beforeEach(async () => {
    await resetLogFile();
  });

  it('POST /api/v1/orchestrator/balance → returns decision and index', async () => {
    const res = await request(app).post('/api/v1/orchestrator/balance').send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('decision');
    expect(res.body.data).toHaveProperty('loadIndex');
    expect(res.body.data).toHaveProperty('redirectedTo');

    const logRaw = await fs.readFile(ORCHESTRATION_LOG_FILE, 'utf-8');
    const logEntries = JSON.parse(logRaw);

    expect(logEntries.length).toBeGreaterThanOrEqual(1);
    expect(logEntries[logEntries.length - 1]).toMatchObject({
      loadIndex: expect.any(Number),
      redirectedTo: expect.any(String),
      status: expect.any(String)
    });
  });
});
