const express = require('express');
const { makeResponse } = require('./utils/responseHelper');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(
    makeResponse('health', {
      uptime: process.uptime()
    })
  );
});

module.exports = router;
