const express = require('express');
const calendarRouter = require('./calendar');
const ciRouter = require('./ci');
const galleryRouter = require('./gallery');
const healthRouter = require('./health');
const legendRouter = require('./legend');

const router = express.Router();

router.use('/calendar', calendarRouter);
router.use('/ci', ciRouter);
router.use('/gallery', galleryRouter);
router.use('/health', healthRouter);
router.use('/legend', legendRouter);

module.exports = router;
