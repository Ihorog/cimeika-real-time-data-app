const express = require('express');
const path = require('path');
const axios = require('axios');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
require('dotenv').config();

const authRouter = require('./routes/auth');
const componentsRouter = require('./routes/components');
const dataRouter = require('./routes/data');
const realtimeRouter = require('./routes/realtime');

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, '..', 'cimeika-api.yaml'));
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
    astrologyEndpoint: '/astrology/forecast'
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

// Hugging Face completion endpoint (mock)
app.post('/ai/huggingface/completion', async (req, res) => {
  const { prompt, model = 'gpt2', max_tokens = 150, temperature = 0.6 } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  const token = process.env.HUGGINGFACE_TOKEN;
  if (!token) {
    // Fallback mock response when no token is configured
    return res.json({
      id: 'hf1',
      object: 'text_completion',
      created: Date.now(),
      model: 'mock-hf',
      choices: [{ text: `HF Echo: ${prompt}`, index: 0, logprobs: null, finish_reason: 'length' }]
    });
  }

  try {
    const url = `https://api-inference.huggingface.co/models/${model}`;
    const response = await axios.post(
      url,
      { inputs: prompt, parameters: { max_new_tokens: max_tokens, temperature } },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    let generated = '';
    if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].generated_text) {
      generated = response.data[0].generated_text;
    } else if (typeof response.data === 'object' && response.data.generated_text) {
      generated = response.data.generated_text;
    } else {
      generated = JSON.stringify(response.data);
    }

    res.json({
      id: `hf-${Date.now()}`,
      object: 'text_completion',
      created: Date.now(),
      model,
      choices: [{ text: generated, index: 0, logprobs: null, finish_reason: 'length' }]
    });
  } catch (err) {
    console.error('HF API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Hugging Face API error' });
  }
});

// Mount feature routers
app.use('/auth', authRouter);
app.use('/components', componentsRouter);
app.use('/data', dataRouter);
app.use('/', realtimeRouter);

module.exports = app;
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
