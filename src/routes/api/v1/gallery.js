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

const ALLOWED_IMAGE_ROOTS = [DATA_DIR, path.join(ROOT_DIR, 'public')];
fs.mkdirSync(ALLOWED_IMAGE_ROOTS[0], { recursive: true });
const RESOLVED_IMAGE_ROOTS = ALLOWED_IMAGE_ROOTS.map((entry) => fs.realpathSync.native(entry));
const DIRECTORY_CACHE_MS = 5000;
const directoryCache = new Map();
const pathMemoCache = new Map();
let galleryCache = null;

function pruneCache(cache) {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (!entry?.timestamp || now - entry.timestamp >= DIRECTORY_CACHE_MS) {
      cache.delete(key);
    }
  }
}

function logStructured(event, payload = {}) {
  console.log(
    JSON.stringify({
      module: 'gallery',
      event,
      timestamp: new Date().toISOString(),
      ...payload
    })
  );
}


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


function cachedRealpath(targetPath) {
  pruneCache(directoryCache);
  const cached = directoryCache.get(targetPath);
  const now = Date.now();
  if (cached && now - cached.timestamp < DIRECTORY_CACHE_MS) return cached.value;
  const resolved = fs.realpathSync.native(targetPath);
  directoryCache.set(targetPath, { value: resolved, timestamp: now });
  return resolved;
}

function cachedReaddir(targetPath) {
  pruneCache(directoryCache);
  const cached = directoryCache.get(`dir:${targetPath}`);
  const now = Date.now();
  if (cached && now - cached.timestamp < DIRECTORY_CACHE_MS) return cached.value;
  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  directoryCache.set(`dir:${targetPath}`, { value: entries, timestamp: now });
  return entries;
}

function ensureWithinRoot(targetPath) {
  try {
    pruneCache(pathMemoCache);
    const now = Date.now();
    const memoKey = String(targetPath);
    const memoized = pathMemoCache.get(memoKey);
    if (memoized && now - memoized.timestamp < DIRECTORY_CACHE_MS) {
      return memoized.value;
    }

    const decoded = decodeURIComponent(targetPath);
    const absolute = path.resolve(decoded);
    const resolvedDir = cachedRealpath(path.dirname(absolute));
    const resolvedPath = path.join(resolvedDir, path.basename(absolute));
    const exists = fs.existsSync(resolvedPath);

    const withinAllowed = RESOLVED_IMAGE_ROOTS.some(
      (root) => resolvedPath === root || resolvedPath.startsWith(`${root}${path.sep}`)
    );

    if (!withinAllowed) {
      logStructured('path_denied', { targetPath, resolved: resolvedPath });
      throw new Error('imagePath is outside the allowed data directory');
    }

    cachedReaddir(resolvedDir);
    logStructured('path_ok', { targetPath, resolved: resolvedPath, exists });
    const value = { resolvedPath, exists };
    pathMemoCache.set(memoKey, { value, timestamp: now });

    return value;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid imagePath';
    logStructured('path_error', { targetPath, error: message });
    throw new Error(message.includes('outside the allowed') ? message : 'Invalid imagePath');
  }
}


function loadGallery() {
  if (galleryCache && Date.now() - galleryCache.timestamp < DIRECTORY_CACHE_MS) {
    logStructured('gallery_cache_hit', { size: galleryCache.data.length });
    return galleryCache.data;
  }
  const data = loadJson(GALLERY_PATH, DEFAULT_ITEMS);
  const normalized = Array.isArray(data) ? data : DEFAULT_ITEMS;
  galleryCache = { data: normalized, timestamp: Date.now() };
  logStructured('gallery_cache_miss', { size: normalized.length });
  return normalized;
}

function persistGallery(items) {
  saveJson(GALLERY_PATH, items);
  galleryCache = { data: items, timestamp: Date.now() };
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
  logStructured('gallery_list', { size: items.length });
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
  logStructured('gallery_upload', { id, emotion, location });

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

    logStructured('path_attempt', { targetPath: imagePath });
    const { resolvedPath, exists } = ensureWithinRoot(imagePath);

    if (!exists) {
      const fallback = { emotion: 'neutral', resonance: 0.5 };
      logStructured('mood_fallback', { imagePath, resolvedPath, reason: 'missing_file' });
      return res.json(
        makeResponse('gallery_mood', {
          image: imagePath,
          ...fallback,
          cacheSize: 0,
          source: 'ci_mitca_gallery'
        })
      );
    }

    const stdout = execFileSync(PYTHON_BIN, [PYTHON_SCRIPT, '--image', resolvedPath], {

      encoding: 'utf-8'
    });
    const payload = JSON.parse(stdout);
    const cacheSnapshot = loadJson(MOOD_CACHE_PATH, {});

    logStructured('mood_success', {
      imagePath: resolvedPath,
      cacheSize: Object.keys(cacheSnapshot).length
    });

    res.json(
      makeResponse('gallery_mood', {
        image: resolvedImagePath,
        ...payload,
        cacheSize: Object.keys(cacheSnapshot).length,
        source: 'ci_mitca_gallery'
      })
    );
  } catch (error) {

    res
      .status(status)
      .json(
        makeResponse(
          'gallery_mood',
          { error: 'Unable to reach gallery mood analyzer', details: message },
          'error'
        )
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
