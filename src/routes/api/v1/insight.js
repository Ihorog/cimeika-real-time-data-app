const express = require('express');
const { makeResponse } = require('./utils/responseHelper');
const { readProfiles } = require('./utils/senseStorage');

const router = express.Router();

function buildSummary(profiles) {
  if (!profiles.length) {
    return {
      profilesCached: 0,
      averageResonance: null,
      latestSignal: null,
      recommendations: ['Запустіть сенсорний міст, щоб отримати перший профіль.']
    };
  }

  const averageResonance =
    profiles.reduce((sum, profile) => sum + (profile.resonance || 0), 0) / profiles.length;
  const latest = profiles[profiles.length - 1];
  const nodeFocus = (latest.nodes || []).map((node) => node.axis).filter(Boolean);
  const resonanceHealth = averageResonance >= 0.9
    ? 'peak'
    : averageResonance >= 0.75
      ? 'stable'
      : 'needs_attention';

  const recommendations = [
    resonanceHealth === 'peak'
      ? 'Зберігайте темп: резонанс між Ci і користувачем максимальний.'
      : 'Оптимізуйте сенси: спробуйте вирівняти силу сигналу до 0.8.',
    nodeFocus.length
      ? `Поточний фокус сенсів: ${nodeFocus.join(', ')}.`
      : 'Очікуємо на фокусні сенси з Python-сервісу.'
  ];

  return {
    profilesCached: profiles.length,
    averageResonance,
    latestSignal: latest.signal || null,
    resonanceHealth,
    recommendations,
    lastUpdated: latest.receivedAt || latest.timestamp || new Date().toISOString()
  };
}

router.get('/', async (req, res) => {
  try {
    const profiles = await readProfiles();
    const summary = buildSummary(profiles);

    res.json(
      makeResponse('insight', {
        summary,
        preview: profiles.slice(-3)
      })
    );
  } catch (error) {
    res.status(500).json(
      makeResponse('insight', { error: error.message }, 'error')
    );
  }
});

module.exports = router;
