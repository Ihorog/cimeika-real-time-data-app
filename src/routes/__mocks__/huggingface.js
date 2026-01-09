module.exports = (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  res.status(503).json({ error: 'HUGGINGFACE_TOKEN not configured' });
};
