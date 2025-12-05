const express = require('express');
const { makeResponse } = require('./utils/responseHelper');
const realtimeRouter = require('../../realtime');
const systemModule = require('./system');

const router = express.Router();

router.get('/summary', async (req, res) => {
  const city = realtimeRouter.normalizeCity(req);
  if (!city) {
    return res
      .status(400)
      .json(makeResponse('realtime_summary', { error: 'invalid city parameter' }, 'error'));
  }

  const sign = realtimeRouter.normalizeSign(req);
  if (!sign) {
    return res
      .status(400)
      .json(makeResponse('realtime_summary', { error: 'invalid sign parameter' }, 'error'));
  }

  try {
    const [weather, astrology, system] = await Promise.all([
      realtimeRouter.fetchWeather(city),
      realtimeRouter.fetchAstrology(sign),
      systemModule.generateMonitorData()
    ]);

    res.json(
      makeResponse('realtime_summary', {
        weather,
        astrology,
        system,
        timestamp: new Date().toISOString()
      })
    );
  } catch (error) {
    console.error('Realtime summary error:', error.message);
    res
      .status(503)
      .json(makeResponse('realtime_summary', { error: 'summary service unavailable' }, 'error'));
  }
});

module.exports = router;
