const express = require('express');
const { makeResponse } = require('./utils/responseHelper');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(
    makeResponse('calendar', {
      events: [],
      note: 'Calendar module stub: schedule events and reminders here.'
    })
  );
});

module.exports = router;
