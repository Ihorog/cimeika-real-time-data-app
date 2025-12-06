const { createApiClient } = require('../core/api');
const config = require('../config');

const DEFAULT_SPACE_URL = 'https://ihorog-cimeika-api.hf.space';

const spaceClient = createApiClient({ timeoutMs: 8000, retries: 1, criticalRetries: 2 });

module.exports = async (req, res) => {
  const { prompt, spaceUrl } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  const baseUrl = (spaceUrl || config.hfSpaceUrl || DEFAULT_SPACE_URL).replace(/\/$/, '');
  if (!baseUrl) return res.status(503).json({ error: 'HF_SPACE_URL not configured' });

  const targetUrl = `${baseUrl}/chat/completion`;

  try {
    const response = await spaceClient.post(targetUrl, { prompt }, { critical: true });
    if (response.status === 'error') {
      throw new Error(response.error);
    }
    res.status(response.statusCode || 200).json(response.data);
  } catch (err) {
    console.error('HF Space proxy error:', err.message);
    const status = err.statusCode || 502;
    res.status(status).json({ error: 'Hugging Face Space unreachable' });
  }
};
