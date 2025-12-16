const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { makeResponse } = require('./utils/responseHelper');
const {
  getProfiles,
  getAverageResonance,
  clearOldProfiles
} = require('./utils/senseStorage');

const router = express.Router();

const ORCHESTRATION_LOG_FILE = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'data',
  'orchestration_log.json'
);

async function ensureOrchestrationLogFile() {
  await fs.mkdir(path.dirname(ORCHESTRATION_LOG_FILE), { recursive: true });

  try {
    await fs.access(ORCHESTRATION_LOG_FILE);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(ORCHESTRATION_LOG_FILE, '[]', 'utf-8');
    } else {
      throw error;
    }
  }
}

async function appendOrchestrationLog(entry) {
  await ensureOrchestrationLogFile();
  let logEntries = [];

  try {
    const raw = await fs.readFile(ORCHESTRATION_LOG_FILE, 'utf-8');
    if (raw.trim()) {
      logEntries = JSON.parse(raw);
    }
  } catch (error) {
    console.warn(`Invalid JSON in ${ORCHESTRATION_LOG_FILE}, resetting orchestration log.`, error.message);
  }

  logEntries.push(entry);
  await fs.writeFile(ORCHESTRATION_LOG_FILE, JSON.stringify(logEntries, null, 2));
}

function determineTarget(loadIndex) {
  return loadIndex > 0.8 ? 'insight' : 'ci';
}

function determineStatus(loadIndex) {
  return loadIndex > 0.85 ? 'rebalanced' : 'stable';
}

async function buildMonitorSnapshot() {
  await clearOldProfiles();
  const profiles = await getProfiles();
  const loadIndex = Number(getAverageResonance(profiles).toFixed(3));
  const modules = ['health', 'ci', 'calendar', 'gallery', 'legend', 'insight', 'system', 'orchestrator'];

  return {
    loadIndex,
    modules,
    profiles: profiles.slice(-3),
    timestamp: new Date().toISOString()
  };
}

router.get('/', (req, res) => {
  res.json(
    makeResponse('orchestrator', {
      message: 'Adaptive orchestrator is online.',
      endpoints: ['/api/v1/orchestrator/balance']
    })
  );
});

router.post('/balance', async (req, res) => {
  try {
    const snapshot = await buildMonitorSnapshot();
    const nextTarget = determineTarget(snapshot.loadIndex);
    const status = determineStatus(snapshot.loadIndex);
    const logEntry = {
      timestamp: snapshot.timestamp,
      loadIndex: snapshot.loadIndex,
      redirectedTo: nextTarget,
      status
    };

    await appendOrchestrationLog(logEntry);

    res.json(
      makeResponse('orchestrator', {
        decision: `Redirecting workflow to ${nextTarget}`,
        loadIndex: snapshot.loadIndex,
        redirectedTo: nextTarget,
        status,
        monitor: snapshot
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(makeResponse('orchestrator', { error: error.message }, 'error'));
  }
});

module.exports = router;
