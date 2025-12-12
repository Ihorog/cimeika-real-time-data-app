const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../src/app');

const galleryPath = path.join(__dirname, '..', 'data', 'gallery.json');
const moodCachePath = path.join(__dirname, '..', 'data', 'gallery_moods.json');
const fixturesDir = path.join(__dirname, 'fixtures');
const outsideFixturePath = path.join(fixturesDir, 'outside-mood.jpg');

const readJson = (filePath, fallback = {}) => {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const persistJson = (filePath, payload) => {
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
};

let originalGallery;
let originalMoodCache;

beforeAll(() => {
  fs.mkdirSync(fixturesDir, { recursive: true });
  fs.writeFileSync(outsideFixturePath, 'outside-image');
  originalGallery = readJson(galleryPath, []);
  originalMoodCache = readJson(moodCachePath, {});
});

afterEach(() => {
  persistJson(galleryPath, originalGallery);
  persistJson(moodCachePath, originalMoodCache);
});

describe('Gallery API', () => {
  it('GET /api/v1/gallery/list → returns gallery items and summary', async () => {
    const res = await request(app).get('/api/v1/gallery/list');

    expect(res.statusCode).toBe(200);
    expect(res.body.module).toBe('gallery');
    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(res.body.data.items[0]).toHaveProperty('emotion');
    expect(res.body.data.summary).toHaveProperty('count');
  });

  it('POST /api/v1/gallery/upload → accepts media payload', async () => {
    const payload = {
      type: 'photo',
      date: '2024-12-01T00:00:00Z',
      location: 'Test City',
      tags: ['upload', 'mock'],
      note: 'demo upload'
    };

    const res = await request(app).post('/api/v1/gallery/upload').send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.module).toBe('gallery_upload');
    expect(res.body.data.item).toHaveProperty('id');
    expect(res.body.data.item.tags).toContain('upload');
  });

  it('POST /api/v1/gallery/mood → proxies python analyzer with cache info', async () => {
    const res = await request(app).post('/api/v1/gallery/mood').send({ imagePath: './public/test.jpg' });

    expect(res.statusCode).toBe(200);
    expect(res.body.module).toBe('gallery_mood');
    expect(res.body.data).toHaveProperty('emotion');
    expect(res.body.data).toHaveProperty('resonance');
    expect(res.body.data.source).toBe('ci_mitca_gallery');

    const cacheAfter = readJson(moodCachePath, {});
    expect(Object.keys(cacheAfter).length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/v1/gallery/mood → rejects path traversal attempts with ../ sequences', async () => {
    const res = await request(app)
      .post('/api/v1/gallery/mood')
      .send({ imagePath: '../cimeika-real-time-data-app/__tests__/fixtures/outside-mood.jpg' });

    expect(res.statusCode).toBe(400);
    expect(res.body.data.error).toBeDefined();
  });

  it('POST /api/v1/gallery/mood → rejects encoded traversal payloads', async () => {
    const encodedPath = '..%2Fcimeika-real-time-data-app%2F__tests__%2Ffixtures%2Foutside-mood.jpg';
    const res = await request(app).post('/api/v1/gallery/mood').send({ imagePath: encodedPath });

    expect(res.statusCode).toBe(400);
    expect(res.body.data.error).toBeDefined();
  });

  it('POST /api/v1/gallery/link → binds media to calendar event', async () => {
    const targetId = originalGallery[0].id;
    const res = await request(app)
      .post('/api/v1/gallery/link')
      .send({ id: targetId, linked_event: 'calendar-link-777' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.item.linked_event).toBe('calendar-link-777');
  });

  it('GET /api/v1/gallery/story → returns composed narrative', async () => {
    const res = await request(app).get('/api/v1/gallery/story');

    expect(res.statusCode).toBe(200);
    expect(res.body.module).toBe('gallery_story');
    expect(res.body.data.story).toMatch(/Казкар|No gallery items/);
    expect(Array.isArray(res.body.data.itemsUsed)).toBe(true);
  });
});
