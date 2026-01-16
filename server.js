
const path = require('path');
const express = require('express');
const { default: OpenAPIBackend } = require('openapi-backend');
const YAML = require('yamljs');

const app = express();
app.use(express.json());

const api = new OpenAPIBackend({ definition: path.join(__dirname, 'cimeika-api.yaml') });

const handlers = {
  createChatCompletion: (c, req, res) => {
    res.json({ result: 'Chat completion stub' });
  },
  collectData: (c, req, res) => {
    res.json({ status: 'data collected' });
  },
  getAstrologicalForecast: (c, req, res) => {
    const { sign } = c.request.query;
    res.json({ forecast: `Forecast for ${sign}` });
  },
  getCurrentTime: (c, req, res) => {
    res.json({ time: new Date().toISOString() });
  },
  getWeatherData: (c, req, res) => {
    const { city } = c.request.query;
    res.json({ weather: 'clear sky', temperature: 20.5, city });
  },
  notFound: (c, req, res) => res.status(404).json({ error: 'Not found' }),
  validationFail: (c, req, res) => {
    // Return a sanitized error message instead of the raw error structure
    const errorMessages = Array.isArray(c.validation.errors)
      ? c.validation.errors.map(e => e.message || 'Invalid input')
      : ['Invalid input'];
    res.status(400).json({ error: errorMessages });
  },
};

api.register(handlers);
api.init();

app.use((req, res) => api.handleRequest(req, req, res));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
