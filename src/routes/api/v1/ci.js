const express = require('express');
const { makeResponse } = require('./utils/responseHelper');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(
    makeResponse('ci', {
      message: 'Ci orchestrator is active and coordinating core modules.'
    })
  );
});

module.exports = router;
