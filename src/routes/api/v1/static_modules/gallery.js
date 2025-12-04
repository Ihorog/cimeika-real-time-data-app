const express = require('express');
const { makeResponse } = require('../utils/responseHelper');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(
    makeResponse('gallery', {
      items: [],
      note: 'Gallery module stub: populate with media entries grouped by theme.'
    })
  );
});

module.exports = router;
