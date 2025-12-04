const express = require('express');
const createResponse = require('./responseHelper');

const router = express.Router();

const modules = ['calendar', 'ci', 'gallery', 'health', 'legend'].sort();

router.get('/', (req, res) => {
  res.json(
    createResponse('api_v1', {
      modules,
      note: 'API v1 stub modules available. Mount specific routes under /api/v1/<module>.'
    })
  );
});

modules.forEach(moduleName => {
  const moduleRouter = require(`./${moduleName}`);
  router.use(`/${moduleName}`, moduleRouter);
});

module.exports = router;
