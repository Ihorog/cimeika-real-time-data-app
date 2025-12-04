const express = require('express');
const os = require('os');
const fs = require('fs/promises');
const path = require('path');
const { makeResponse } = require('./utils/responseHelper');
const { readProfiles } = require('./utils/senseStorage');

const router = express.Router();

const MONITOR_LOG_FILE = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'data',
  'system_monitor_log.json'
);

async function ensureMonitorLogFile() {
  await fs.mkdir(path.dirname(MONITOR_LOG_FILE), { recursive: true });

  try {
    await fs.access(MONITOR_LOG_FILE);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(MONITOR_LOG_FILE, '[]', 'utf-8');
    } else {
      throw error;
    }
  }
}

async function appendMonitorLog(entry) {
  await ensureMonitorLogFile();
  let logEntries = [];

  try {
    const raw = await fs.readFile(MONITOR_LOG_FILE, 'utf-8');
    if (raw.trim()) {
      logEntries = JSON.parse(raw);
    }
  } catch (error) {
    console.warn(`Invalid JSON in ${MONITOR_LOG_FILE}, resetting monitor log.`, error.message);
  }

  logEntries.push(entry);
  await fs.writeFile(MONITOR_LOG_FILE, JSON.stringify(logEntries, null, 2));
}

function determineStatus(avgResonance) {
  if (avgResonance >= 0.8) return 'stable';
  if (avgResonance >= 0.5) return 'monitoring';
  return 'degraded';
}

router.get('/', (req, res) => {
  res.json(
    makeResponse('system', {
      endpoints: ['/api/v1/system/monitor']
    })
  );
});

router.get('/monitor', async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const profiles = await readProfiles();
    const resonanceValue = profiles.length
      ? profiles.reduce((sum, profile) => sum + (Number(profile.resonance) || 0), 0) / profiles.length
      : 0;
    const avgResonance = Number(resonanceValue.toFixed(3));
    const modules = ['health', 'ci', 'calendar', 'gallery', 'legend', 'insight'];
    const responseTimeMs = Number(process.hrtime.bigint() - start) / 1e6;
    const timestamp = new Date().toISOString();

    const payload = {
      hostname: os.hostname(),
      uptime: process.uptime(),
      api: {
        status: 'online',
        responseTimeMs
      },
      avgResonance,
      modules,
      profiles: profiles.slice(-3),
      timestamp
    };

    await appendMonitorLog({
      timestamp,
      avgResonance,
      modules,
      status: determineStatus(avgResonance)
    });

    res.json(makeResponse('system_monitor', payload));
  } catch (error) {
    res.status(500).json(
      makeResponse('system_monitor', { error: error.message }, 'error')
    );
  }
});

module.exports = router;
