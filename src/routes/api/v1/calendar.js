const express = require('express');
const createResponse = require('./responseHelper');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(
    createResponse('calendar', {
      events: [],
      note: 'Calendar module stub: schedule events and reminders here.'
    })
  );
});

module.exports = router;
