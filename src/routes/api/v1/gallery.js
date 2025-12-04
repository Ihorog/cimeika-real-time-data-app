const express = require('express');
const createResponse = require('./responseHelper');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(
    createResponse('gallery', {
      items: [],
      note: 'Gallery module stub: populate with media entries grouped by theme.'
    })
  );
});

module.exports = router;
