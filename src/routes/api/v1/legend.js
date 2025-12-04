const express = require('express');
const createResponse = require('./responseHelper');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(
    createResponse('legend', {
      message: 'Legend module placeholder: consolidate narrative fragments here.'
    })
  );
});

module.exports = router;
