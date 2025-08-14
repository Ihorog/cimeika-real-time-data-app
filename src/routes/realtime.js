const express = require('express');
const axios = require('axios');
const router = express.Router();

const DEFAULT_CITY = process.env.DEFAULT_CITY || 'London';
const DEFAULT_SIGN = process.env.DEFAULT_SIGN || 'aries';

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

// --- Weather and astrology endpoints using external APIs -------------------

async function fetchWeather(city) {
  const url = `https://goweather.herokuapp.com/weather/${encodeURIComponent(city)}`;
  const { data } = await axios.get(url, { timeout: 5000, proxy: false });
  const tempMatch = data.temperature?.match(/-?\d+/);
  const temperature = tempMatch ? parseInt(tempMatch[0], 10) : null;
  return makeWeatherResponse(city, data.description || 'N/A', temperature);
}

async function fetchAstrology(sign) {
  const url = `https://aztro.sameerkumar.website/?sign=${encodeURIComponent(sign)}&day=today`;
  const { data } = await axios.post(url, null, { timeout: 5000, proxy: false });
  return makeAstrologyResponse(sign, data.description || 'N/A');
}

// Return current weather data for the requested city
router.get('/weather/current', async (req, res) => {
  const city = normalizeQueryParam(req, 'city', DEFAULT_CITY);
  try {
    const result = await fetchWeather(city);
    res.json(result);
  } catch (err) {
    console.error('Weather API error:', err.message);
    res.status(503).json({ error: 'weather service unavailable' });
  }
});

// Return an astrology forecast for the requested sign
router.get('/astrology/forecast', async (req, res) => {
  const sign = normalizeQueryParam(req, 'sign', DEFAULT_SIGN);
  try {
    const result = await fetchAstrology(sign);
    res.json(result);
  } catch (err) {
    console.error('Astrology API error:', err.message);
    res.status(503).json({ error: 'astrology service unavailable' });
  }
});

router.get('/time/current', (req, res) => {
  res.json({ time: new Date().toISOString() });
});

router.get('/data/weather', async (req, res) => {
  const city = normalizeQueryParam(req, 'city', DEFAULT_CITY);
  try {
    const result = await fetchWeather(city);
    res.json(result);
  } catch (err) {
    console.error('Weather API error:', err.message);
    res.status(503).json({ error: 'weather service unavailable' });
  }
});

router.get('/data/astrology', async (req, res) => {
  const sign = normalizeQueryParam(req, 'sign', DEFAULT_SIGN);
  try {
    const result = await fetchAstrology(sign);
    res.json(result);
  } catch (err) {
    console.error('Astrology API error:', err.message);
    res.status(503).json({ error: 'astrology service unavailable' });
  }
});

module.exports = router;
