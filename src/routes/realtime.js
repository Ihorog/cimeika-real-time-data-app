const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/weather/current', async (req, res) => {
  const key = process.env.WEATHER_API_KEY;
  if (!key) {
    return res
      .status(503)
      .json({ error: 'service unavailable: missing WEATHER_API_KEY' });
  }

  try {
    const city = req.query.city || 'London';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;
    const response = await axios.get(url);
    const data = response.data;
    res.json({
      weather: data.weather[0].description,
      temperature: Math.round(data.main.temp - 273.15)
    });
  } catch (err) {
    res.status(500).json({ error: 'Weather data unavailable' });
  }
});

router.get('/astrology/forecast', async (req, res) => {
  const key = process.env.ASTROLOGY_API_KEY;
  if (!key) {
    return res
      .status(503)
      .json({ error: 'service unavailable: missing ASTROLOGY_API_KEY' });
  }

  try {
    const sign = req.query.sign || 'aries';
    const url = `https://api.freeastrologyapi.com/forecast?sign=${sign}&apikey=${key}`;
    const response = await axios.get(url);
    res.json({ forecast: response.data.forecast });
  } catch (err) {
    res.status(500).json({ error: 'Astrological data unavailable' });
  }
});

router.get('/time/current', (req, res) => {
  res.json({ time: new Date().toISOString() });
});

router.get('/data/weather', (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'city required' });
  res.json({ city, weather: 'clear sky', temperature: 20.5 });
});

router.get('/data/astrology', (req, res) => {
  const { sign } = req.query;
  if (!sign) return res.status(400).json({ error: 'sign required' });
  res.json({ sign, forecast: 'Today is a good day for new beginnings.' });
});

module.exports = router;
