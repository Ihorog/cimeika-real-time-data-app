function requireHfToken(req, res, next) {
  const token = process.env.HUGGINGFACE_TOKEN;
  if (!token) {
    console.error(
      'HUGGINGFACE_TOKEN is not set. Set it in your environment, e.g.,',
      'export HUGGINGFACE_TOKEN="<your-hf-api-token>" or add it to your .env file.'
    );
    return res.status(503).json({ error: 'HUGGINGFACE_TOKEN not configured' });
  }
  req.hfToken = token;
  next();
}

module.exports = requireHfToken;
