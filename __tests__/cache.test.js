jest.mock('axios', () => {
  const axiosMock = { get: jest.fn(), post: jest.fn() };
  axiosMock.create = jest.fn(() => axiosMock);
  return axiosMock;
});

jest.mock('axios-retry', () => {
  const retryMock = jest.fn();
  retryMock.exponentialDelay = jest.fn(() => 0);
  return retryMock;
});

const axios = require('axios');

describe('cache cleanup', () => {
  let realtime;

  afterAll(() => {
    if (realtime) realtime.stopCacheSweep();
  });

  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    axios.get.mockResolvedValue({ data: { description: 'Sunny', temperature: '+20 C' } });
    axios.post.mockResolvedValue({ data: { description: 'Great day ahead' } });
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

