const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/weather/current', async (req, res) => {
  const key = process.env.OPENWEATHER_KEY;
  if (!key) {
    return res
      .status(503)
      .json({ error: 'service unavailable: missing OPENWEATHER_KEY' });
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
  const key = process.env.ASTROLOGY_KEY;
  if (!key) {
    return res
      .status(503)
      .json({ error: 'service unavailable: missing ASTROLOGY_KEY' });
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
  res.json({ weather: 'clear sky', temperature: 20.5 });
});

router.get('/data/astrology', (req, res) => {
  res.json({ forecast: 'Today is a good day for new beginnings.' });
});

module.exports = router;
