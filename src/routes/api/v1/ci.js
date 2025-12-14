const express = require('express');
const { makeResponse } = require('./utils/responseHelper');
const { appendProfile } = require('./utils/senseStorage');
const { createApiClient } = require('../../../../core/api');
const router = express.Router();
const SENSE_ENDPOINT = process.env.SENSE_ENDPOINT || 'http://localhost:8000/mitca/sense';
const SENSE_TIMEOUT_MS = Number(process.env.SENSE_TIMEOUT_MS || 5000);

const SENSE_RETRIES = Number(process.env.SENSE_RETRIES || 2);

const senseClient = createApiClient({
  timeoutMs: SENSE_TIMEOUT_MS,
  retries: SENSE_RETRIES,
  criticalRetries: SENSE_RETRIES + 1,
});

let lastSuccessfulSense = null;


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

    const enrichedResponse = makeResponse('ci_sense', enrichedPayload);
    lastSuccessfulSense = enrichedResponse;

    res.json(enrichedResponse);
  } catch (error) {
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
            fallback: {
              used: true,
              cached: Boolean(lastSuccessfulSenseResponse),
              reason: 'Unable to reach semantic sense service',
              details: error.message
            }
          },
          lastSuccessfulSenseResponse ? 'warning' : 'error'
        )
      );
  }
});

module.exports = router;
