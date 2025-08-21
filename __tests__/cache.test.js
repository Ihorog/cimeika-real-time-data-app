describe('cache cleanup', () => {
  let realtime;

  afterAll(() => {
    if (realtime) realtime.stopCacheSweep();
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
});

