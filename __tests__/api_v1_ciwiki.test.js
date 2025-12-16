const nock = require('nock');
const request = require('supertest');
const app = require('../src/app');
const { buildConnectors, previewLines } = require('../src/routes/api/v1/ciwiki');
const { resetCache } = require('../src/services/ciwikiClient');

const REPO = process.env.CIWIKI_REPO || 'Ihorog/ciwiki';
const BRANCH = process.env.CIWIKI_BRANCH || 'main';

function mockIndex() {
  return nock('https://api.github.com')
    .get(`/repos/${REPO}/contents`)
    .query({ ref: BRANCH })
    .reply(200, [
      {
        name: 'README.md',
        path: 'README.md',
        type: 'file',
        download_url: `https://raw.githubusercontent.com/${REPO}/${BRANCH}/README.md`,
        html_url: `https://github.com/${REPO}/blob/${BRANCH}/README.md`
      },
      {
        name: 'legend-ci.md',
        path: 'legend-ci.md',
        type: 'file',
        download_url: `https://raw.githubusercontent.com/${REPO}/${BRANCH}/legend-ci.md`,
        html_url: `https://github.com/${REPO}/blob/${BRANCH}/legend-ci.md`
      },
      {
        name: 'src',
        path: 'src',
        type: 'dir',
        download_url: null,
        html_url: `https://github.com/${REPO}/tree/${BRANCH}/src`
      }
    ]);
}

function mockReadme(body = '# ciwiki\nMain knowledge base') {
  return nock('https://raw.githubusercontent.com')
    .get(`/${REPO}/${BRANCH}/README.md`)
    .reply(200, body);
}

describe('ciwiki integration module', () => {
  beforeAll(() => {
    nock.disableNetConnect();
    nock.enableNetConnect(/127\.0\.0\.1/);
  });

  afterEach(() => {
    nock.cleanAll();
    resetCache();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  it('exposes overview with connectors and featured documents', async () => {
    mockIndex();
    mockReadme('# ciwiki\nCimeika knowledge library');

    const res = await request(app).get('/api/v1/ciwiki');

    expect(res.statusCode).toBe(200);
    expect(res.body.module).toBe('ciwiki');
    expect(res.body.data.connectors.repo).toContain(REPO);
    expect(res.body.data.featured).toHaveLength(2);
    expect(res.body.data.readmePreview[0]).toContain('ciwiki');
  });

  it('returns the repo index snapshot', async () => {
    mockIndex();

    const res = await request(app).get('/api/v1/ciwiki/index');

    expect(res.statusCode).toBe(200);
    expect(res.body.module).toBe('ciwiki_index');
    expect(res.body.data.entries).toHaveLength(3);
    expect(res.body.data.entries[0].name).toBe('README.md');
  });

  it('serves document content when path is valid', async () => {
    mockReadme('## Legend CI');

    const res = await request(app).get('/api/v1/ciwiki/content').query({ path: 'README.md' });

    expect(res.statusCode).toBe(200);
    expect(res.body.module).toBe('ciwiki_content');
    expect(res.body.data.content).toContain('Legend CI');
    expect(res.body.data.source).toContain('/README.md');
  });

  it('rejects unsafe paths', async () => {
    const res = await request(app)
      .get('/api/v1/ciwiki/content')
      .query({ path: '../secrets.env' });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('provides connector defaults', () => {
    const connectors = buildConnectors();
    expect(connectors.repo).toContain(REPO);
    expect(connectors.knowledgeEndpoints.index).toBe('/api/v1/ciwiki/index');
  });

  it('builds a compact preview of text lines', () => {
    const preview = previewLines('line1\n\nline2\nline3', 2);
    expect(preview).toEqual(['line1', 'line2']);
  });
});
