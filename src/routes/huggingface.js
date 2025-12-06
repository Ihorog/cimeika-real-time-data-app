const { createApiClient } = require('../core/api');

const hfClient = createApiClient({ timeoutMs: 8000, retries: 1, criticalRetries: 2 });

module.exports = async (req, res) => {
  const { prompt, model = 'gpt2', max_tokens = 150, temperature = 0.6 } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  const token = req.hfToken;

  try {
    const url = `https://api-inference.huggingface.co/models/${model}`;
    const response = await hfClient.post(
      url,
      { inputs: prompt, parameters: { max_new_tokens: max_tokens, temperature } },
      { headers: { Authorization: `Bearer ${token}` }, critical: true }
    );

    if (response.status === 'error') {
      throw new Error(response.error);
    }

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
    console.error('HF API error:', err.message);
    res.status(500).json({ error: 'Hugging Face API error' });
  }
};
