const axios = require('axios');
const express = require('express');
const { makeResponse } = require('./utils/responseHelper');
const { appendProfile } = require('./utils/senseStorage');

const router = express.Router();
const SENSE_ENDPOINT = process.env.SENSE_ENDPOINT || 'http://localhost:8000/mitca/sense';

router.get('/', (req, res) => {
  res.json(
    makeResponse('ci', {
      message: 'Ci orchestrator is active and coordinating core modules.'
    })
  );
});

router.get('/sense', async (req, res) => {
  try {
    const { data: payload } = await axios.get(SENSE_ENDPOINT, { proxy: false });
    const strength = Number(payload?.signal?.strength ?? 0);
    const resonance = 1 / (1 + Math.abs(strength - 0.8));
    const enrichedPayload = {
      ...payload,
      resonance,
      receivedAt: new Date().toISOString()
    };

    await appendProfile(enrichedPayload);

    res.json(makeResponse('ci_sense', enrichedPayload));
  } catch (error) {
    res
      .status(502)
      .json(
        makeResponse(
          'ci_sense',
          { error: 'Unable to reach semantic sense service', details: error.message },
          'error'
        )
      );
  }
});

module.exports = router;
