const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
require('dotenv').config();

const authRouter = require('./routes/auth');
const componentsRouter = require('./routes/components');
const dataRouter = require('./routes/data');
const realtimeRouter = require('./routes/realtime');
const huggingfaceCompletion = require('./routes/huggingface');

const DEFAULT_CITY = process.env.DEFAULT_CITY || 'London';
const DEFAULT_SIGN = process.env.DEFAULT_SIGN || 'aries';

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, '..', 'cimeika-api.yaml'));
// Parse JSON request bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Root path serves index.html for convenience
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Endpoint to expose config values for client
app.get('/config', (req, res) => {
  res.json({
    weatherEndpoint: '/weather/current',
    astrologyEndpoint: '/astrology/forecast',
    defaultCity: DEFAULT_CITY,
    defaultSign: DEFAULT_SIGN
  });
});

// Serve OpenAPI specification
app.get('/openapi', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'cimeika-api.yaml'));
});

// Interactive API docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Chat completion endpoint (mock)
app.post('/chat/completion', (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  res.json({
    id: 'chat1',
    object: 'text_completion',
    created: Date.now(),
    model: 'mock',
    choices: [{ text: `Echo: ${prompt}`, index: 0, logprobs: null, finish_reason: 'length' }]
  });
});

// Hugging Face completion endpoint
app.post('/ai/huggingface/completion', huggingfaceCompletion);

// Mount feature routers
app.use('/auth', authRouter);
app.use('/components', componentsRouter);
app.use('/data', dataRouter);
app.use('/', realtimeRouter);

app.use((req, res) => res.status(404).json({ error: 'not found' }));

module.exports = app;
  if (require.main === module) {
    const PORT = process.env.PORT || 7860;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }
