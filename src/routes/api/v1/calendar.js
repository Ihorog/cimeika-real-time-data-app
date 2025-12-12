const express = require('express');
const fs = require('fs');
const path = require('path');
const { makeResponse } = require('./utils/responseHelper');

const router = express.Router();

const ROOT_DIR = path.join(__dirname, '..', '..', '..', '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const CALENDAR_FILE = path.join(DATA_DIR, 'calendar.json');
const SYNC_STATE_FILE = path.join(DATA_DIR, 'calendar_sync_state.json');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');

const DEFAULT_EVENTS = [
  {
    id: 'calendar-walk-001',
    title: 'Ранкова прогулянка з кавою',
    date: '2024-11-21T07:20:00Z',
    time: '07:20',
    category: 'wellbeing',
    location: 'Kyiv, UA',
    shared: false,
    recurring: false,
    reminder: true,
    linked_gallery_id: 'g-aurora'
  },
  {
    id: 'calendar-family-015',
    title: 'Родинний день на Дніпрі',
    date: '2024-10-05T16:45:00Z',
    time: '16:45',
    category: 'family',
    location: 'Dnipro River',
    shared: true,
    recurring: false,
    reminder: false,
    linked_gallery_id: 'g-river'
  },
  {
    id: 'calendar-lab-042',
    title: 'ML Lab — адаптивні сенси',
    date: '2024-05-16T09:00:00Z',
    time: '09:00',
    category: 'learning',
    location: 'Online',
    shared: false,
    recurring: true,
    reminder: true,
    linked_gallery_id: null
  },
  {
    id: 'calendar-run-073',
    title: 'Morning Run',
    date: '2024-05-15T06:30:00Z',
    time: '06:30',
    category: 'health',
    location: 'Kyiv Park',
    shared: false,
    recurring: true,
    reminder: true,
    linked_gallery_id: null
  }
];

const DEFAULT_HEALTH_EVENTS = [
  {
    title: 'Fitbit Steps',
    date: '2024-05-14T21:00:00Z',
    category: 'health',
    metric: 'steps',
    value: 10234,
    source: 'fitbit'
  },
  {
    title: 'Garmin Sleep Score',
    date: '2024-05-14T06:00:00Z',
    category: 'health',
    metric: 'sleep',
    value: 82,
    source: 'garmin'
  }
];

const DEFAULT_LOCAL_EVENTS = [
  {
    title: 'Lviv IT Arena meetup',
    category: 'learning',
    date: '2024-05-20T17:30:00Z',
    city: 'Львів'
  },
  {
    title: 'Kyiv Jazz Open Air',
    category: 'culture',
    date: '2024-05-22T18:00:00Z',
    city: 'Київ'
  },
  {
    title: 'Dnipro river clean-up',
    category: 'community',
    date: '2024-05-25T09:30:00Z',
    city: 'Київ'
  }
];

function ensureFile(filePath, fallback) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
  }
}

function readJson(filePath, fallback) {
  ensureFile(filePath, fallback);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.warn(`Invalid JSON at ${filePath}, falling back.`, error.message);
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function loadEvents() {
  return readJson(CALENDAR_FILE, DEFAULT_EVENTS);
}

function persistEvents(events) {
  writeJson(CALENDAR_FILE, events);
  return events;
}

function loadGalleryIndex() {
  const gallery = readJson(GALLERY_FILE, []);
  return gallery.reduce((acc, item) => {
    if (item.linked_event) {
      acc[item.linked_event] = acc[item.linked_event] || [];
      acc[item.linked_event].push({
        id: item.id,
        emotion: item.emotion,
        note: item.note,
        location: item.location,
        date: item.date
      });
    }
    return acc;
  }, {});
}

function attachGallery(events) {
  const index = loadGalleryIndex();
  return events.map((event) => ({
    ...event,
    gallery: index[event.id] || []
  }));
}

function buildCategoryBalance(events) {
  const total = events.length || 1;
  const balance = events.reduce((acc, event) => {
    const key = event.category || 'other';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(balance)
    .map(([category, count]) => ({
      category,
      count,
      weight: Number((count / total).toFixed(2))
    }))
    .sort((a, b) => b.count - a.count);
}

function buildTimeline(events) {
  return [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8)
    .map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      category: event.category,
      shared: Boolean(event.shared),
      recurring: Boolean(event.recurring)
    }));
}

function buildInsights(events) {
  const now = new Date();
  const recurring = events.filter((event) => event.recurring);
  const upcoming = events.filter((event) => new Date(event.date) > now);
  const shared = events.filter((event) => event.shared);
  const balance = buildCategoryBalance(events);

  const insights = [
    {
      title: 'Повторювані патерни',
      detail: recurring.length
        ? `Знайдено ${recurring.length} повторюваних подій. Активуйте нагадування, щоб утримати ритм.`
        : 'Повторюваних подій ще немає — створіть циклічні нагадування для стабільності.',
      tone: recurring.length ? 'emerald' : 'sky'
    },
    {
      title: 'Баланс категорій',
      detail: balance.length
        ? `Домінує ${balance[0].category} — ${balance[0].weight * 100}% записів.`
        : 'Поки що немає подій — додайте перші записи.',
      tone: 'amber'
    },
    {
      title: 'Спільні потоки',
      detail: shared.length
        ? `Є ${shared.length} родинних/командних подій. Узгодьте нагадування з календарями учасників.`
        : 'Спільних подій немає — поділіться лінком /family/{id}.',
      tone: shared.length ? 'emerald' : 'sky'
    },
    {
      title: 'Ближчі дедлайни',
      detail: upcoming.length
        ? `Маєте ${upcoming.length} майбутніх подій. Перший дедлайн: ${upcoming[0].title}.`
        : 'Нових подій не виявлено — згенеруйте локальні рекомендації.',
      tone: upcoming.length ? 'emerald' : 'sky'
    }
  ];

  return {
    insights,
    balance,
    timeline: buildTimeline(upcoming.length ? upcoming : events),
    stats: {
      total: events.length,
      recurring: recurring.length,
      shared: shared.length,
      upcoming: upcoming.length
    }
  };
}

function buildLocalEvents(city, interests) {
  const interested = interests && interests.length ? interests.map((item) => item.toLowerCase()) : [];
  const filtered = DEFAULT_LOCAL_EVENTS.filter((event) => {
    const cityMatch = !city || event.city?.toLowerCase() === city.toLowerCase();
    const interestMatch = !interested.length || interested.some((interest) => event.category.includes(interest));
    return cityMatch && interestMatch;
  });

  return filtered.length ? filtered : DEFAULT_LOCAL_EVENTS;
}

function updateGalleryLink(galleryId, eventId) {
  if (!galleryId) return null;
  const gallery = readJson(GALLERY_FILE, []);
  const target = gallery.find((item) => item.id === galleryId);
  if (!target) return null;

  target.linked_event = eventId;
  writeJson(GALLERY_FILE, gallery);
  return target;
}

router.get('/', (req, res) => {
  const events = attachGallery(loadEvents());
  const syncState = readJson(SYNC_STATE_FILE, { lastSync: null, provider: null, received: 0 });

  res.json(
    makeResponse('calendar', {
      message: 'Calendar orchestrator активовано. Дані синхронізовано з локальним сховищем.',
      stats: {
        events: events.length,
        linkedGallery: events.filter((event) => event.gallery.length).length,
        recurring: events.filter((event) => event.recurring).length
      },
      sync: syncState,
      endpoints: {
        events: '/api/v1/calendar/events',
        insights: '/api/v1/calendar/insights',
        local: '/api/v1/calendar/local?city=Київ&interest=music',
        health: '/api/v1/calendar/health/fitbit',
        family: '/api/v1/calendar/family/shared-family'
      }
    })
  );
});

router.get('/events', (req, res) => {
  const events = attachGallery(loadEvents());
  res.json(
    makeResponse('calendar_events', {
      events,
      count: events.length
    })
  );
});

router.post('/events', (req, res) => {
  const {
    id,
    title,
    date,
    time,
    category = 'other',
    location = 'unspecified',
    shared = false,
    recurring = false,
    reminder = false,
    linked_gallery_id: linkedGalleryId
  } = req.body || {};

  if (!title || !date) {
    return res.status(400).json(makeResponse('calendar_events', { error: 'title and date are required' }, 'error'));
  }

  const events = loadEvents();
  const targetIndex = events.findIndex((event) => event.id === id);
  const payload = {
    id: id || `calendar-${Date.now()}`,
    title,
    date,
    time: time || new Date(date).toISOString().slice(11, 16),
    category,
    location,
    shared: Boolean(shared),
    recurring: Boolean(recurring),
    reminder: Boolean(reminder),
    linked_gallery_id: linkedGalleryId || null
  };

  let action = 'created';
  if (targetIndex >= 0) {
    events[targetIndex] = { ...events[targetIndex], ...payload };
    action = 'updated';
  } else {
    events.unshift(payload);
  }

  persistEvents(events);
  const galleryLink = updateGalleryLink(linkedGalleryId, payload.id);

  res.status(action === 'created' ? 201 : 200).json(
    makeResponse('calendar_events', {
      event: payload,
      action,
      galleryLink
    })
  );
});

router.get('/insights', (req, res) => {
  const events = attachGallery(loadEvents());
  const summary = buildInsights(events);

  res.json(
    makeResponse('calendar_insights', {
      ...summary,
      galleryLinks: events.filter((event) => event.gallery.length)
    })
  );
});

router.post('/sync/:provider', (req, res) => {
  const provider = req.params.provider;
  const incoming = Array.isArray(req.body?.events) ? req.body.events : [];
  const events = loadEvents();

  const merged = [...events];
  incoming.forEach((event, index) => {
    const id = event.id || `sync-${provider}-${Date.now()}-${index}`;
    const hydrated = {
      id,
      title: event.title || `${provider} import ${index + 1}`,
      date: event.date || new Date().toISOString(),
      time: event.time || '00:00',
      category: event.category || provider,
      location: event.location || 'sync',
      shared: Boolean(event.shared),
      recurring: Boolean(event.recurring),
      reminder: Boolean(event.reminder),
      linked_gallery_id: event.linked_gallery_id || null
    };

    const existingIndex = merged.findIndex((item) => item.id === id);
    if (existingIndex >= 0) {
      merged[existingIndex] = { ...merged[existingIndex], ...hydrated };
    } else {
      merged.push(hydrated);
    }
  });

  persistEvents(merged);

  const syncState = {
    provider,
    received: incoming.length,
    lastSync: new Date().toISOString()
  };
  writeJson(SYNC_STATE_FILE, syncState);

  res.json(
    makeResponse('calendar_sync', {
      provider,
      synced: incoming.length,
      totalEvents: merged.length,
      lastSync: syncState.lastSync,
      insights: buildInsights(merged)
    })
  );
});

router.get('/family/:sharedId', (req, res) => {
  const sharedId = req.params.sharedId;
  const events = attachGallery(loadEvents());
  const sharedEvents = events.filter((event) => event.shared || event.shared_with?.includes(sharedId));

  res.json(
    makeResponse('calendar_family', {
      sharedId,
      events: sharedEvents,
      count: sharedEvents.length,
      suggestion:
        sharedEvents.length > 0
          ? 'Синхронізуйте з Telegram ботом для сповіщень усіх членів сімʼї.'
          : 'Додайте події з прапором shared: true, щоб побачити їх тут.'
    })
  );
});

router.get('/health/:provider', (req, res) => {
  const provider = req.params.provider;
  const events = DEFAULT_HEALTH_EVENTS.filter((event) => event.source === provider || provider === 'all');

  res.json(
    makeResponse('calendar_health', {
      provider,
      events: events.length ? events : DEFAULT_HEALTH_EVENTS,
      note: 'Health sync дієва: події додаються до календаря при наступному sync.'
    })
  );
});

router.get('/local', (req, res) => {
  const { city, interest } = req.query;
  const interests = Array.isArray(interest)
    ? interest
    : interest
      ? [interest]
      : [];

  const events = buildLocalEvents(city, interests);

  res.json(
    makeResponse('calendar_local', {
      city: city || 'any',
      events,
      interests
    })
  );
});

module.exports = router;
