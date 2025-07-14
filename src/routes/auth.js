const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username && password) {
    return res.json({ token: 'mocktoken' });
  }
  res.status(400).json({ error: 'Invalid credentials' });
});

module.exports = router;
