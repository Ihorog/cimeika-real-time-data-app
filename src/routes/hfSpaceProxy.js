const axios = require('axios');
const config = require('../config');

const DEFAULT_SPACE_URL = 'https://ihorog-cimeika-api.hf.space';

module.exports = async (req, res) => {
  const { prompt, spaceUrl } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  const baseUrl = (spaceUrl || config.hfSpaceUrl || DEFAULT_SPACE_URL).replace(/\/$/, '');
  if (!baseUrl) return res.status(503).json({ error: 'HF_SPACE_URL not configured' });

  const targetUrl = `${baseUrl}/chat/completion`;

  try {
    const response = await axios.post(targetUrl, { prompt });
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error('HF Space proxy error:', err.response?.data || err.message);
    const status = err.response?.status || 502;
    res.status(status).json({ error: 'Hugging Face Space unreachable' });
  }
};
