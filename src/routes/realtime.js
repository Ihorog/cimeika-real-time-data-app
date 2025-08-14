const express = require('express');
const router = express.Router();

// Helper to trim query params and apply defaults
function normalizeQueryParam(req, key, defaultValue) {
  const value = req.query[key];
  return typeof value === 'string' && value.trim() ? value.trim() : defaultValue;
}

// Factory helpers for common JSON responses
const makeWeatherResponse = (city, weather, temperature) => ({
  city,
  weather,
  temperature,
});

const makeAstrologyResponse = (sign, forecast) => ({
  sign,
  forecast,
});

// --- Weather and astrology mock endpoints ---------------------------------

// Return current weather data for the requested city (default London)
router.get('/weather/current', (req, res) => {
  const city = normalizeQueryParam(req, 'city', 'London');
  res.json(makeWeatherResponse(city, 'sunny with light winds', 20));
});

// Return an astrology forecast for the requested sign (default aries)
router.get('/astrology/forecast', (req, res) => {
  const sign = normalizeQueryParam(req, 'sign', 'aries');
  res.json(makeAstrologyResponse(sign, 'Your stars look bright today.'));
});

router.get('/time/current', (req, res) => {
  res.json({ time: new Date().toISOString() });
});

router.get('/data/weather', (req, res) => {
  const city = normalizeQueryParam(req, 'city', 'London');
  res.json(makeWeatherResponse(city, 'clear sky', 20));
});

router.get('/data/astrology', (req, res) => {
  const sign = normalizeQueryParam(req, 'sign', 'aries');
  res.json(makeAstrologyResponse(sign, 'A great day for new beginnings.'));
});

module.exports = router;
