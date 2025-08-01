const express = require('express');
const router = express.Router();

// --- Weather and astrology mock endpoints ---------------------------------

// Return a simple weather message for the requested city
router.get('/weather/current', (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'city required' });
  res.json({ message: `The current weather in ${city} is sunny with light winds.` });
});

// Return a simple astrology forecast for the requested sign
router.get('/astrology/forecast', (req, res) => {
  const { sign } = req.query;
  if (!sign) return res.status(400).json({ error: 'sign required' });
  res.json({ message: `Your stars look bright today, ${sign}.` });
});

router.get('/time/current', (req, res) => {
  res.json({ time: new Date().toISOString() });
});

router.get('/data/weather', (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'city required' });
  res.json({ message: `Mock weather data for ${city}: clear sky and 20°C.` });
});

router.get('/data/astrology', (req, res) => {
  const { sign } = req.query;
  if (!sign) return res.status(400).json({ error: 'sign required' });
  res.json({ message: `Mock astrology data for ${sign}: a great day for new beginnings.` });
});

module.exports = router;
