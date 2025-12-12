const express = require('express');
const createResponse = require('./responseHelper');
const { MODULES } = require('./modules');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(
    createResponse('api_v1', {
      modules: MODULES,
      note: 'API v1 stub modules available. Mount specific routes under /api/v1/<module>.'
    })
  );
});

MODULES.forEach(moduleName => {
  const moduleRouter = require(`./${moduleName}`);
  router.use(`/${moduleName}`, moduleRouter);
});

module.exports = router;
