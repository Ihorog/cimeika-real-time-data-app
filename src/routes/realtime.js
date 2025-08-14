const express = require('express');
const router = express.Router();

// --- Weather and astrology mock endpoints ---------------------------------

// Return current weather data for the requested city (default London)
router.get('/weather/current', (req, res) => {
  const city = req.query.city || 'London';
  res.json({ city, weather: 'sunny with light winds', temperature: 20 });
});

// Return an astrology forecast for the requested sign (default aries)
router.get('/astrology/forecast', (req, res) => {
  const sign = req.query.sign || 'aries';
  res.json({ sign, forecast: 'Your stars look bright today.' });
});

router.get('/time/current', (req, res) => {
  res.json({ time: new Date().toISOString() });
});

router.get('/data/weather', (req, res) => {
  const city = req.query.city || 'London';
  res.json({ city, weather: 'clear sky', temperature: 20 });
});

router.get('/data/astrology', (req, res) => {
  const sign = req.query.sign || 'aries';
  res.json({ sign, forecast: 'A great day for new beginnings.' });
});

module.exports = router;
