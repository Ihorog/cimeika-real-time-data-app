const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root path serves index.html for convenience
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to expose config values for client
app.get('/config', (req, res) => {
  res.json({
    weatherEndpoint: '/weather/current',
    astrologyEndpoint: '/astrology/forecast'
  });
});

// Simple in-memory stores
const components = new Map();
let componentCounter = 1;

const dataStore = new Map();
let dataCounter = 1;

// Authentication endpoint
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username && password) {
    // simple check
    return res.json({ token: 'mocktoken' });
  }
  res.status(400).json({ error: 'Invalid credentials' });
});

// Chat completion endpoint (mock)
app.post('/chat/completion', (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  res.json({ id: 'chat1', object: 'text_completion', created: Date.now(), model: 'mock', choices: [{ text: `Echo: ${prompt}`, index: 0, logprobs: null, finish_reason: 'length' }] });
});

// Hugging Face completion endpoint (mock)
app.post('/ai/huggingface/completion', (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  res.json({ id: 'hf1', object: 'text_completion', created: Date.now(), model: 'mock-hf', choices: [{ text: `HF Echo: ${prompt}`, index: 0, logprobs: null, finish_reason: 'length' }] });
});

// Data pipeline endpoints
app.post('/data/collect', (req, res) => {
  const id = 'data-' + dataCounter++;
  dataStore.set(id, req.body);
  res.json({ status: 'success', id });
});

app.post('/data/log', (req, res) => {
  const { dataId, logDetails } = req.body || {};
  if (!dataStore.has(dataId)) return res.status(404).json({ error: 'data not found' });
  res.json({ status: 'success' });
});

app.post('/data/analyze', (req, res) => {
  const { dataId } = req.body || {};
  if (!dataStore.has(dataId)) return res.status(404).json({ error: 'data not found' });
  res.json({ analysis: { result: 'analysis-result' } });
});

app.post('/data/save', (req, res) => {
  const { dataId } = req.body || {};
  if (!dataStore.has(dataId)) return res.status(404).json({ error: 'data not found' });
  res.json({ status: 'success' });
});

app.post('/data/transfer', (req, res) => {
  const { dataId } = req.body || {};
  if (!dataStore.has(dataId)) return res.status(404).json({ error: 'data not found' });
  res.json({ status: 'success' });
});

app.post('/data/predict', (req, res) => {
  const { dataId } = req.body || {};
  if (!dataStore.has(dataId)) return res.status(404).json({ error: 'data not found' });
  res.json({ prediction: { value: 'predict-result' } });
});

// Component CRUD
app.get('/components', (req, res) => {
  res.json(Array.from(components.values()));
});

app.post('/components', (req, res) => {
  const id = 'component-' + componentCounter++;
  const component = { id, ...req.body };
  components.set(id, component);
  res.status(201).json(component);
});

app.get('/components/:id', (req, res) => {
  const component = components.get(req.params.id);
  if (!component) return res.status(404).json({ error: 'not found' });
  res.json(component);
});

app.put('/components/:id', (req, res) => {
  if (!components.has(req.params.id)) return res.status(404).json({ error: 'not found' });
  const component = { id: req.params.id, ...req.body };
  components.set(req.params.id, component);
  res.json(component);
});

app.delete('/components/:id', (req, res) => {
  if (!components.has(req.params.id)) return res.status(404).end();
  components.delete(req.params.id);
  res.status(204).end();
});

app.post('/components/:id/link', (req, res) => {
  if (!components.has(req.params.id)) return res.status(404).json({ error: 'not found' });
  res.json({ status: 'linked' });
});

app.post('/components/:id/unlink', (req, res) => {
  if (!components.has(req.params.id)) return res.status(404).json({ error: 'not found' });
  res.json({ status: 'unlinked' });
});

app.get('/components/:id/attributes', (req, res) => {
  if (!components.has(req.params.id)) return res.status(404).json({ error: 'not found' });
  const component = components.get(req.params.id);
  res.json(component.attributes || []);
});

// Simple real-time data endpoints
app.get('/weather/current', async (req, res) => {
  try {
    const city = req.query.city || 'London';
    const key = process.env.OPENWEATHER_KEY;
    if (!key) throw new Error('OPENWEATHER_KEY not configured');
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

app.get('/astrology/forecast', async (req, res) => {
  try {
    const sign = req.query.sign || 'aries';
    const key = process.env.ASTROLOGY_KEY;
    if (!key) throw new Error('ASTROLOGY_KEY not configured');
    const url = `https://api.freeastrologyapi.com/forecast?sign=${sign}&apikey=${key}`;
    const response = await axios.get(url);
    res.json({ forecast: response.data.forecast });
  } catch (err) {
    res.status(500).json({ error: 'Astrological data unavailable' });
  }
});

app.get('/time/current', (req, res) => {
  res.json({ time: new Date().toISOString() });
});

app.get('/data/weather', (req, res) => {
  res.json({ weather: 'clear sky', temperature: 20.5 });
});

app.get('/data/astrology', (req, res) => {
  res.json({ forecast: 'Today is a good day for new beginnings.' });
});

module.exports = app;
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
