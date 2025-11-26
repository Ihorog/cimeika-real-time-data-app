const config = require('../config');

let warnedMissingToken = false;

function requireHfToken(req, res, next) {
  const token = config.hfToken;
  if (!token) {
    if (!warnedMissingToken) {
      console.warn(
        'HUGGINGFACE_TOKEN is not set. Set it in your environment, e.g.,',
        'export HUGGINGFACE_TOKEN="<your-hf-api-token>" or add it to your .env file.'
      );
      warnedMissingToken = true;
    }
    return res.status(503).json({ error: 'HUGGINGFACE_TOKEN not configured' });
  }
  req.hfToken = token;
  next();
}

module.exports = requireHfToken;
