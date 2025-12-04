const express = require('express');
const calendarRouter = require('./calendar');
const ciRouter = require('./ci');
const galleryRouter = require('./gallery');
const healthRouter = require('./health');
const legendRouter = require('./legend');
const createResponse = require('./responseHelper');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(
    createResponse('api_v1', {
      modules: ['ci', 'legend', 'gallery', 'calendar', 'health'],
      note: 'API v1 stub modules available. Mount specific routes under /api/v1/<module>.'
    })
  );
});

router.use('/calendar', calendarRouter);
router.use('/ci', ciRouter);
router.use('/gallery', galleryRouter);
router.use('/health', healthRouter);
router.use('/legend', legendRouter);

module.exports = router;
