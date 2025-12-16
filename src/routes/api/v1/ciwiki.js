const express = require('express');
const config = require('../../../config');
const {
  buildRawUrl,
  fetchDocument,
  fetchRepoIndex,
  resetCache,
  sanitizePath
} = require('../../../services/ciwikiClient');
const { makeResponse } = require('./utils/responseHelper');

const router = express.Router();

const CIWIKI_REPO = process.env.CIWIKI_REPO || 'Ihorog/ciwiki';
const CIWIKI_BRANCH = process.env.CIWIKI_BRANCH || 'main';
const CIMEIKA_REPO = process.env.CIMEIKA_REPO || 'Ihorog/cimeika';

function previewLines(text, limit = 6) {
  return (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function buildConnectors() {
  return {
    repo: `https://github.com/${CIWIKI_REPO}`,
    branch: CIWIKI_BRANCH,
    rawBase: buildRawUrl(''),
    huggingfaceSpace: config.hfSpaceUrl,
    cimeikaRepo: `https://github.com/${CIMEIKA_REPO}`,
    orchestratorApi: '/api/v1',
    knowledgeEndpoints: {
      index: '/api/v1/ciwiki/index',
      content: '/api/v1/ciwiki/content?path=README.md'
    }
  };
}

router.get('/', async (req, res) => {
  try {
    const [rootEntries, readme] = await Promise.all([
      fetchRepoIndex().catch(() => []),
      fetchDocument('README.md').catch(() => '')
    ]);

    const featured = rootEntries
      .filter((entry) => entry.type === 'file' && entry.name.toLowerCase().endsWith('.md'))
      .slice(0, 5)
      .map((entry) => ({ name: entry.name, path: entry.path, url: entry.downloadUrl }));

    res.json(
      makeResponse('ciwiki', {
        message: 'ciwiki knowledge base connected to Cimeika fabric.',
        connectors: buildConnectors(),
        featured,
        readmePreview: previewLines(readme),
        upstreamLinks: {
          huggingface: `${config.hfSpaceUrl}/api`,
          orchestrator: `${config.hfSpaceUrl}/api/v1`,
          cimeikaFrontend: 'https://github.com/Ihorog/cimeika'
        }
      })
    );
  } catch (error) {
    res
      .status(502)
      .json(makeResponse('ciwiki', { error: 'Unable to reach ciwiki repository', details: error.message }, 'error'));
  }
});

router.get('/index', async (req, res) => {
  try {
    const entries = await fetchRepoIndex();
    res.json(
      makeResponse('ciwiki_index', {
        branch: CIWIKI_BRANCH,
        repo: CIWIKI_REPO,
        entries
      })
    );
  } catch (error) {
    res
      .status(502)
      .json(makeResponse('ciwiki_index', { error: 'Unable to load ciwiki index', details: error.message }, 'error'));
  }
});

router.get('/content', async (req, res) => {
  const { path } = req.query;
  try {
    const safePath = sanitizePath(path);
    const content = await fetchDocument(safePath);
    res.json(
      makeResponse('ciwiki_content', {
        path: safePath,
        branch: CIWIKI_BRANCH,
        repo: CIWIKI_REPO,
        source: buildRawUrl(safePath),
        content
      })
    );
  } catch (error) {
    const status = error.message?.includes('path') ? 400 : 502;
    res
      .status(status)
      .json(makeResponse('ciwiki_content', { error: error.message || 'Unable to load document' }, 'error'));
  }
});

router.post('/reset-cache', (_req, res) => {
  resetCache();
  res.json(makeResponse('ciwiki_cache', { cleared: true }));
});

module.exports = router;
module.exports.previewLines = previewLines;
module.exports.buildConnectors = buildConnectors;
