const express = require('express');
const { makeResponse } = require('./utils/responseHelper');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(
    makeResponse('legend', {
      message: 'Legend module placeholder: consolidate narrative fragments here.'
    })
  );
});

module.exports = router;
