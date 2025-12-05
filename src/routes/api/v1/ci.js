const axios = require('axios');
const express = require('express');
const { makeResponse } = require('./utils/responseHelper');
const { appendProfile } = require('./utils/senseStorage');

const router = express.Router();
const SENSE_ENDPOINT = process.env.SENSE_ENDPOINT || 'http://localhost:8000/mitca/sense';
const SENSE_TIMEOUT_MS = Number(process.env.SENSE_TIMEOUT_MS || 5000);
const SENSE_RETRY_COUNT = Number(process.env.SENSE_RETRY_COUNT || 3);
const SENSE_RETRY_DELAY_MS = Number(process.env.SENSE_RETRY_DELAY_MS || 300);

let lastSuccessfulSenseResponse = null;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchSenseWithRetry() {
  let attempt = 0;
  let lastError;

  while (attempt < SENSE_RETRY_COUNT) {
    try {
      const { data } = await axios.get(SENSE_ENDPOINT, {
        proxy: false,
        timeout: SENSE_TIMEOUT_MS
      });

      return data;
    } catch (error) {
      lastError = error;
      attempt += 1;

      if (attempt >= SENSE_RETRY_COUNT) {
        throw lastError;
      }

      await wait(SENSE_RETRY_DELAY_MS);
    }
  }

  throw lastError;
}

router.get('/', (req, res) => {
  res.json(
    makeResponse('ci', {
      message: 'Ci orchestrator is active and coordinating core modules.'
    })
  );
});
router.get('/sense', async (req, res) => {
  try {
    const payload = await fetchSenseWithRetry();
    const strength = Number(payload?.signal?.strength ?? 0);
    const resonance = 1 / (1 + Math.abs(strength - 0.8));
    const enrichedPayload = {
      ...payload,
      resonance,
      receivedAt: new Date().toISOString()
    };

    lastSuccessfulSenseResponse = enrichedPayload;
    await appendProfile(enrichedPayload);

    res.json(makeResponse('ci_sense', enrichedPayload));
  } catch (error) {
    const errorMessage = 'Unable to reach semantic sense service';
    const fallbackPayload =
      lastSuccessfulSenseResponse ||
      {
        signal: { strength: 0, status: 'unavailable' },
        resonance: 0,
        receivedAt: new Date().toISOString()
      };

    res
      .status(lastSuccessfulSenseResponse ? 200 : 502)
      .json(
        makeResponse(
          'ci_sense',
          {
            ...fallbackPayload,
            error: errorMessage,
            fallback: {
              used: true,
              cached: Boolean(lastSuccessfulSenseResponse),
              reason: errorMessage,
              details: error.message
            }
          },
          lastSuccessfulSenseResponse ? 'warning' : 'error'
        )
      );
  }
});

module.exports = router;
