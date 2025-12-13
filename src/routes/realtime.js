const express = require('express');
const { createApiClient } = require('../../core/api');
const config = require('../config');
const router = express.Router();

const http = createApiClient({
  timeoutMs: 5000,
  retries: 1,
  retryDelayMs: 200,
  criticalRetries: 3,
});

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 100;
const weatherCache = new Map();
const astrologyCache = new Map();
const CACHE_SWEEP_INTERVAL_MS = 60 * 1000;
const MAX_CITY_LENGTH = 80;
const CITY_PATTERN = /^[\p{L}\s.'-]+$/u;
const VALID_SIGNS = new Set([
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces'
]);

function logSweep(cacheName, count) {
  if (count > 0) console.info(`[realtime-cache] swept ${count} expired entries from ${cacheName}`);
}

function purgeExpiredEntries() {
  const now = Date.now();
  let weatherRemoved = 0;
  let astrologyRemoved = 0;

  for (const [key, value] of weatherCache.entries()) {
    if (value.expiry <= now) {
      weatherCache.delete(key);
      weatherRemoved += 1;
    }
  }
  for (const [key, value] of astrologyCache.entries()) {
    if (value.expiry <= now) {
      astrologyCache.delete(key);
      astrologyRemoved += 1;
    }
  }

  logSweep('weather cache', weatherRemoved);
  logSweep('astrology cache', astrologyRemoved);
}

function clearCaches() {
  weatherCache.clear();
  astrologyCache.clear();
}

const purgeTimer = setInterval(purgeExpiredEntries, CACHE_SWEEP_INTERVAL_MS);
if (purgeTimer.unref) purgeTimer.unref();

function stopCacheSweep() {
  clearInterval(purgeTimer);
}

const DEFAULT_CITY = config.defaultCity;
const DEFAULT_SIGN = config.defaultSign;

function evictLeastRecentlyUsed(cache, cacheName) {
  const oldestKey = cache.keys().next().value;
  if (oldestKey !== undefined) {
    cache.delete(oldestKey);
    console.info(`[realtime-cache] evicted LRU entry from ${cacheName}: ${oldestKey}`);
  }
}

function setCacheEntry(cache, key, value, cacheName) {
  if (cache.size >= MAX_CACHE_SIZE) evictLeastRecentlyUsed(cache, cacheName);
  cache.set(key, value);
}

function getCacheEntry(cache, key, cacheName) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiry <= Date.now()) {
    cache.delete(key);
    console.info(`[realtime-cache] expired ${cacheName} entry removed: ${key}`);
    return null;
  }
  cache.delete(key);
  cache.set(key, entry);
  return entry.data;
}

// Helper to trim query params and apply defaults
function normalizeQueryParam(req, key, defaultValue) {
  const value = req.query[key];
  return typeof value === 'string' && value.trim() ? value.trim() : defaultValue;
}

function isValidCity(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= MAX_CITY_LENGTH &&
    CITY_PATTERN.test(value)
  );
}

function normalizeCity(req) {
  const city = normalizeQueryParam(req, 'city', DEFAULT_CITY);
  return isValidCity(city) ? city : null;
}

function normalizeSign(req) {
  const sign = normalizeQueryParam(req, 'sign', DEFAULT_SIGN).toLowerCase();
  return VALID_SIGNS.has(sign) ? sign : null;
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
  const cached = getCacheEntry(weatherCache, city, 'weather cache');
  if (cached) return cached;
  const url = `https://goweather.herokuapp.com/weather/${encodeURIComponent(city)}`;
  const result = await http.get(url, { critical: true });
  if (result.status === 'error') throw new Error(result.error);

  const tempMatch = result.data?.temperature?.match(/-?\d+/);
  const temperature = tempMatch ? parseInt(tempMatch[0], 10) : null;
  const payload = makeWeatherResponse(city, result.data?.description || 'N/A', temperature);
  setCacheEntry(weatherCache, city, { data: payload, expiry: Date.now() + CACHE_TTL_MS }, 'weather cache');
  return payload;
}

async function fetchAstrology(sign) {
  const cached = getCacheEntry(astrologyCache, sign, 'astrology cache');
  if (cached) return cached;
  const url = `https://aztro.sameerkumar.website/?sign=${encodeURIComponent(sign)}&day=today`;
  const result = await http.post(url, null, { critical: true });
  if (result.status === 'error') throw new Error(result.error);
  const payload = makeAstrologyResponse(sign, result.data?.description || 'N/A');
  setCacheEntry(
    astrologyCache,
    sign,
    { data: payload, expiry: Date.now() + CACHE_TTL_MS },
    'astrology cache'
  );
  return payload;
}

// Return current weather data for the requested city
router.get('/weather/current', async (req, res) => {
  const city = normalizeCity(req);
  if (!city) return res.status(400).json({ error: 'invalid city parameter' });
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
  const sign = normalizeSign(req);
  if (!sign) return res.status(400).json({ error: 'invalid sign parameter' });
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
  const city = normalizeCity(req);
  if (!city) return res.status(400).json({ error: 'invalid city parameter' });
  try {
    const result = await fetchWeather(city);
    res.json(result);
  } catch (err) {
    console.error('Weather API error:', err.message);
    res.status(503).json({ error: 'weather service unavailable' });
  }
});

router.get('/data/astrology', async (req, res) => {
  const sign = normalizeSign(req);
  if (!sign) return res.status(400).json({ error: 'invalid sign parameter' });
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
module.exports.stopCacheSweep = stopCacheSweep;
module.exports.fetchWeather = fetchWeather;
module.exports.fetchAstrology = fetchAstrology;
module.exports.normalizeCity = normalizeCity;
module.exports.normalizeSign = normalizeSign;
module.exports.MAX_CACHE_SIZE = MAX_CACHE_SIZE;
