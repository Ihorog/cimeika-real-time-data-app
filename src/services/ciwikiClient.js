const { createApiClient } = require('../../core/api');

const DEFAULT_REPO = process.env.CIWIKI_REPO || 'Ihorog/ciwiki';
const DEFAULT_BRANCH = process.env.CIWIKI_BRANCH || 'main';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const ghClient = createApiClient({
  baseUrl: 'https://api.github.com',
  timeoutMs: 8000,
  retries: 1,
  defaultHeaders: GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {},
});

const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function cacheKey(type, path) {
  return `${type}:${path}`;
}

function setCache(key, value, ttlMs = CACHE_TTL_MS) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function buildRawUrl(path) {
  return `https://raw.githubusercontent.com/${DEFAULT_REPO}/${DEFAULT_BRANCH}/${path}`;
}

async function fetchRepoIndex(path = '') {
  const key = cacheKey('index', path || '/');
  const cached = getCache(key);
  if (cached) return cached;

  const cleanPath = path ? `/${path.replace(/^\//, '')}` : '';
  const params = new URLSearchParams({ ref: DEFAULT_BRANCH });
  const requestPath = `/repos/${DEFAULT_REPO}/contents${cleanPath}?${params.toString()}`;
  const response = await ghClient.get(requestPath, { critical: true });
  if (response.status === 'error') {
    throw new Error(response.error);
  }

  const normalized = (Array.isArray(data) ? data : [data]).map((item) => ({
    name: item.name,
    path: item.path,
    type: item.type,
    downloadUrl: item.download_url,
    htmlUrl: item.html_url
  }));

  setCache(key, normalized);
  return normalized;
}

async function fetchDocument(path = 'README.md') {
  const sanitized = sanitizePath(path);
  const key = cacheKey('doc', sanitized);
  const cached = getCache(key);
  if (cached) return cached;

  const url = buildRawUrl(sanitized);
  const response = await ghClient.get(url, { asJson: false, critical: true });
  if (response.status === 'error') {
    throw new Error(response.error);
  }
  setCache(key, response.data);
  return response.data;
}

function sanitizePath(path) {
  const candidate = (path || '').trim();
  if (!candidate) throw new Error('path required');
  if (candidate.includes('..') || candidate.startsWith('/')) {
    throw new Error('path outside repository is not allowed');
  }
  if (!/^[A-Za-z0-9._\-/]+$/.test(candidate)) {
    throw new Error('path contains invalid characters');
  }
  return candidate;
}

function resetCache() {
  cache.clear();
}

module.exports = {
  buildRawUrl,
  fetchDocument,
  fetchRepoIndex,
  resetCache,
  sanitizePath
};
