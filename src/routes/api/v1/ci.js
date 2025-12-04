const express = require('express');
const createResponse = require('./responseHelper');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(
    createResponse('ci', {
      message: 'Ci orchestrator is active and coordinating core modules.'
    })
  );
});

module.exports = router;
