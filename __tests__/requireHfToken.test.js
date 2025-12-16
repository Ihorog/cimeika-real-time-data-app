const originalEnv = { ...process.env };

function buildMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe('requireHfToken middleware warnings', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv.NODE_ENV;
    if (originalEnv.HUGGINGFACE_TOKEN) {
      process.env.HUGGINGFACE_TOKEN = originalEnv.HUGGINGFACE_TOKEN;
    } else {
      delete process.env.HUGGINGFACE_TOKEN;
    }
  });

  it('does not log a warning in test environment', () => {
    process.env.NODE_ENV = 'test';
    delete process.env.HUGGINGFACE_TOKEN;
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const requireHfToken = require('../src/middleware/requireHfToken');
    const res = buildMockRes();
    requireHfToken({}, res, () => {});

    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('logs a warning outside test environment', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.HUGGINGFACE_TOKEN;
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const requireHfToken = require('../src/middleware/requireHfToken');
    const res = buildMockRes();
    requireHfToken({}, res, () => {});

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
