const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const crypto = require('crypto');
const express = require('express');
const { makeResponse } = require('./utils/responseHelper');

const router = express.Router();

const ROOT_DIR = path.join(__dirname, '..', '..', '..', '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const GALLERY_PATH = path.join(DATA_DIR, 'gallery.json');
const MOOD_CACHE_PATH = path.join(DATA_DIR, 'gallery_moods.json');
const PYTHON_SCRIPT = path.join(ROOT_DIR, 'api', 'ci_mitca_gallery.py');
const PYTHON_BIN = process.env.PYTHON_BIN || 'python3';

const DEFAULT_ITEMS = [
  {
    id: 'g-aurora',
    type: 'photo',
    date: '2024-11-21T07:20:00Z',
    location: 'Kyiv, UA',
    emotion: 'happy',
    resonance: 0.86,
    tags: ['sunrise', 'city', 'calm'],
    linked_event: 'calendar-walk-001',
    note: 'Ранковий променад з кавою',
    source: 'archive'
  }
];

function loadJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    return fallback;
  }
}

function saveJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function loadGallery() {
  const data = loadJson(GALLERY_PATH, DEFAULT_ITEMS);
  return Array.isArray(data) ? data : DEFAULT_ITEMS;
}

function persistGallery(items) {
  saveJson(GALLERY_PATH, items);
}

function buildSummary(items) {
  const emotionCounts = items.reduce((acc, item) => {
    const emotion = item.emotion || 'neutral';
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {});

  return {
    count: items.length,
    emotionCounts,
    latest: items.slice(0, 3)
  };
}

router.get('/', (req, res) => {
  res.json(
    makeResponse('gallery', {
      message: 'Gallery module captures images, emotions, and links to Calendar/Nastrij/Kazkar streams.'
    })
  );
});

router.get('/list', (req, res) => {
  const items = loadGallery();
  res.json(makeResponse('gallery', { items, summary: buildSummary(items) }));
});

router.post('/upload', (req, res) => {
  const { type, date, location, emotion = 'neutral', resonance, tags = [], linked_event, note, source } =
    req.body || {};

  if (!type || !date || !location) {
    return res
      .status(400)
      .json(
        makeResponse(
          'gallery_upload',
          { error: 'type, date, and location are required' },
          'error'
        )
      );
  }

  const items = loadGallery();
  const id = `g-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
  const newItem = {
    id,
    type,
    date,
    location,
    emotion,
    resonance: typeof resonance === 'number' ? Math.min(Math.max(resonance, 0), 1) : 0.5,
    tags,
    linked_event: linked_event || null,
    note: note || '',
    source: source || 'upload'
  };

  const updated = [newItem, ...items];
  persistGallery(updated);

  res.status(201).json(makeResponse('gallery_upload', { item: newItem }));
});

router.post('/mood', (req, res) => {
  const { imagePath } = req.body || {};
  if (!imagePath) {
    return res
      .status(400)
      .json(makeResponse('gallery_mood', { error: 'imagePath required' }, 'error'));
  }

  try {
    const stdout = execFileSync(PYTHON_BIN, [PYTHON_SCRIPT, '--image', imagePath], {
      encoding: 'utf-8'
    });
    const payload = JSON.parse(stdout);
    const cacheSnapshot = loadJson(MOOD_CACHE_PATH, {});

    res.json(
      makeResponse('gallery_mood', {
        image: imagePath,
        ...payload,
        cacheSize: Object.keys(cacheSnapshot).length,
        source: 'ci_mitca_gallery'
      })
    );
  } catch (error) {
    res
      .status(502)
      .json(
        makeResponse('gallery_mood', { error: 'Unable to reach gallery mood analyzer', details: error.message }, 'error')
      );
  }
});

router.post('/link', (req, res) => {
  const { id, linked_event } = req.body || {};
  if (!id || !linked_event) {
    return res
      .status(400)
      .json(makeResponse('gallery_link', { error: 'id and linked_event required' }, 'error'));
  }

  const items = loadGallery();
  const target = items.find((entry) => entry.id === id);

  if (!target) {
    return res
      .status(404)
      .json(makeResponse('gallery_link', { error: 'item not found' }, 'error'));
  }

  target.linked_event = linked_event;
  persistGallery(items);

  res.json(makeResponse('gallery_link', { item: target }));
});

router.get('/story', (req, res) => {
  const items = loadGallery();
  const moodCache = loadJson(MOOD_CACHE_PATH, {});
  const selected = items.slice(0, 3);

  const story =
    selected.length === 0
      ? 'No gallery items available to build a story yet.'
      : `Казкар сплітає ${selected.length} фрагменти пам'яті: ${selected
          .map((item) => `${item.location} (${item.emotion})`)
          .join(', ')}. Дані підсилено настроєм та подіями з Calendar.`;

  res.json(
    makeResponse('gallery_story', {
      story,
      itemsUsed: selected,
      moodHints: Object.keys(moodCache).length,
      kazkarSource: '/api/v1/kazkar/story',
      calendarLink: '/api/v1/calendar/link'
    })
  );
});

module.exports = router;
