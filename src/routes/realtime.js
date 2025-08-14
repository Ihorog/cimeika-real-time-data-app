const express = require('express');
const axios = require('axios');
const axiosRetry = require('axios-retry');
const router = express.Router();

const http = axios.create({ timeout: 5000, proxy: false });
axiosRetry(http, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const CACHE_TTL_MS = 5 * 60 * 1000;
const weatherCache = new Map();
const astrologyCache = new Map();
const CACHE_SWEEP_INTERVAL_MS = 60 * 1000;

function purgeExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of weatherCache.entries()) {
    if (value.expiry <= now) weatherCache.delete(key);
  }
  for (const [key, value] of astrologyCache.entries()) {
    if (value.expiry <= now) astrologyCache.delete(key);
  }
}

function clearCaches() {
  weatherCache.clear();
  astrologyCache.clear();
}

const purgeTimer = setInterval(purgeExpiredEntries, CACHE_SWEEP_INTERVAL_MS);
if (purgeTimer.unref) purgeTimer.unref();

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
  const cached = weatherCache.get(city);
  if (cached) {
    if (cached.expiry > Date.now()) return cached.data;
    weatherCache.delete(city);
  }
  const url = `https://goweather.herokuapp.com/weather/${encodeURIComponent(city)}`;
  const { data } = await http.get(url);
  const tempMatch = data.temperature?.match(/-?\d+/);
  const temperature = tempMatch ? parseInt(tempMatch[0], 10) : null;
  const result = makeWeatherResponse(city, data.description || 'N/A', temperature);
  weatherCache.set(city, { data: result, expiry: Date.now() + CACHE_TTL_MS });
  return result;
}

async function fetchAstrology(sign) {
  const cached = astrologyCache.get(sign);
  if (cached) {
    if (cached.expiry > Date.now()) return cached.data;
    astrologyCache.delete(sign);
  }
  const url = `https://aztro.sameerkumar.website/?sign=${encodeURIComponent(sign)}&day=today`;
  const { data } = await http.post(url, null);
  const result = makeAstrologyResponse(sign, data.description || 'N/A');
  astrologyCache.set(sign, { data: result, expiry: Date.now() + CACHE_TTL_MS });
  return result;
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
module.exports.clearCaches = clearCaches;
module.exports._weatherCache = weatherCache;
module.exports._astrologyCache = astrologyCache;
