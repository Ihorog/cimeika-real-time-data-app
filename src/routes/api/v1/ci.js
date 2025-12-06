const express = require('express');
const { makeResponse } = require('./utils/responseHelper');
const { appendProfile } = require('./utils/senseStorage');
const { createApiClient } = require('../../../core/api');

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
    const { status, data: payload, error } = await senseClient.get(SENSE_ENDPOINT, { critical: true });
    if (status === 'error') {
      throw new Error(error || 'sense endpoint unreachable');
    }

    const strength = Number(payload?.signal?.strength ?? 0);
    const resonance = 1 / (1 + Math.abs(strength - 0.8));
    const enrichedPayload = {
      ...payload,
      resonance,
      receivedAt: new Date().toISOString()
    };

    await appendProfile(enrichedPayload);

    const enrichedResponse = makeResponse('ci_sense', enrichedPayload);
    lastSuccessfulSense = enrichedResponse;

    res.json(enrichedResponse);
  } catch (error) {
    const fallbackSense =
      lastSuccessfulSense ||
      makeResponse('ci_sense', {
        signal: { strength: 0 },
        resonance: 0,
        receivedAt: new Date().toISOString(),
        note: 'Fallback response: semantic sense service is unavailable.'
      });

    res.status(502).json(
      makeResponse(
        'ci_sense',
        {
          error: 'Unable to reach semantic sense service',
          details: error.message,
          fallback: fallbackSense
        },
        'error'
      )
    );
  }
});

module.exports = router;
