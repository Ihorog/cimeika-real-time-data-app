const express = require('express');
const createResponse = require('./responseHelper');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(
    createResponse('health', {
      timestamp: new Date().toISOString()
    })
  );
});

module.exports = router;
