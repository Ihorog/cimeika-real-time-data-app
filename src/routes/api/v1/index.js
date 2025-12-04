const express = require('express');
const { makeResponse } = require('./utils/responseHelper');
const health = require('./health');
const ci = require('./ci');
const calendar = require('./calendar');
const gallery = require('./gallery');
const legend = require('./legend');

const router = express.Router();
const modules = { health, ci, calendar, gallery, legend };

router.get('/', (req, res) =>
  res.json(makeResponse('v1', { availableModules: Object.keys(modules) }))
);

Object.entries(modules).forEach(([name, moduleRouter]) => {
  router.use(`/${name}`, moduleRouter);
});

module.exports = router;
