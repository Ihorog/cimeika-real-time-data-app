const successResponse = (payload) =>
  Promise.resolve({ ok: true, status: 200, json: async () => payload, text: async () => JSON.stringify(payload) });

describe('cache cleanup', () => {
  let realtime;

  afterAll(() => {
    if (realtime) realtime.stopCacheSweep();
  });

  beforeAll(() => {
    global.fetch = jest.fn();
  });

  beforeEach(() => {
    global.fetch.mockReset();
    global.fetch.mockImplementation((url) => {
      if (url.includes('goweather')) return successResponse({ description: 'Sunny', temperature: '+20 C' });
      if (url.includes('aztro')) return successResponse({ description: 'Great day ahead' });
      return successResponse({});
    });
  });

  it('purges expired entries after interval', () => {
    jest.useFakeTimers();
    realtime = require('../src/routes/realtime');
    const weather = realtime._weatherCache;
    const astro = realtime._astrologyCache;

    realtime.clearCaches();
    const past = Date.now() - 1000;
    weather.set('city', { data: {}, expiry: past });
    astro.set('sign', { data: {}, expiry: past });

    expect(weather.size).toBe(1);
    expect(astro.size).toBe(1);

    jest.advanceTimersByTime(60 * 1000);

    expect(weather.size).toBe(0);
    expect(astro.size).toBe(0);

    realtime.clearCaches();
    jest.useRealTimers();
  });

  it('evicts the least recently used entry when the cache exceeds its limit', async () => {
    realtime = require('../src/routes/realtime');
    const { fetchWeather, _weatherCache: cache, MAX_CACHE_SIZE } = realtime;

    realtime.clearCaches();

    for (let i = 0; i < MAX_CACHE_SIZE; i += 1) {
      await fetchWeather(`City${i}`);
    }

    expect(cache.size).toBe(MAX_CACHE_SIZE);
    expect(cache.has('City0')).toBe(true);

    await fetchWeather('City-new');

    expect(cache.size).toBe(MAX_CACHE_SIZE);
    expect(cache.has('City0')).toBe(false);
    expect(cache.has('City-new')).toBe(true);
  });
});

