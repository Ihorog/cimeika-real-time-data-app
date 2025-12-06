const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const nativeFetch = typeof fetch !== "undefined" ? fetch : null;

function normalizePath(path = "") {
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
}

function buildUrl(baseUrl, path) {
  if (!baseUrl) return path;
  const trimmed = baseUrl.replace(/\/$/, "");
  return `${trimmed}${normalizePath(path)}`;
}

function resolveFetch(fetchImpl) {
  if (typeof fetchImpl === "function") return fetchImpl;
  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const { fetch: undiciFetch } = require("node:undici");
    return undiciFetch;
  } catch (error) {
    throw new Error("fetch implementation is required for API client");
  }
}

function createApiClient({
  baseUrl = "",
  timeoutMs = 5000,
  retries = 1,
  retryDelayMs = 250,
  backoffMultiplier = 2,
  criticalRetries = 3,
  defaultHeaders = {},
  fetchImpl = nativeFetch,
  logger = console,
} = {}) {
  const resolvedFetch = resolveFetch(fetchImpl);

  async function fetchWithTimeout(url, options = {}, timeout = timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error("timeout")), timeout);
    try {
      const response = await resolvedFetch(url, { ...options, signal: controller.signal });
      return response;
    } finally {
      clearTimeout(timer);
    }
  }

  function shouldRetry(status) {
    return RETRYABLE_STATUS.has(status);
  }

  async function request(pathOrUrl, {
    method = "GET",
    body,
    headers = {},
    timeout = timeoutMs,
    asJson = true,
    retry = retries,
    critical = false,
  } = {}) {
    const url = pathOrUrl.startsWith("http") ? pathOrUrl : buildUrl(baseUrl, pathOrUrl);
    const maxAttempts = (critical ? Math.max(retry, criticalRetries) : retry) + 1;
    let attempt = 0;
    let lastError;
    let lastStatus;

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        const response = await fetchWithTimeout(
          url,
          {
            method,
            headers: {
              "Content-Type": "application/json",
              ...defaultHeaders,
              ...headers,
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
          },
          timeout,
        );

        lastStatus = response.status;
        const payload = asJson ? await response.json().catch(() => null) : await response.text();

        if (!response.ok) {
          if (shouldRetry(response.status) && attempt < maxAttempts) {
            const backoff = retryDelayMs * Math.pow(backoffMultiplier, attempt - 1);
            await sleep(backoff);
            continue;
          }
          return {
            status: "error",
            statusCode: response.status,
            error:
              (payload && (payload.error || payload.message)) ||
              `Request failed with status ${response.status}`,
          };
        }

        return {
          status: "ok",
          statusCode: response.status,
          data: payload,
        };
      } catch (error) {
        lastError = error;
        const isAbort = error?.name === "AbortError" || error?.message === "timeout";
        if (attempt < maxAttempts && (critical || isAbort)) {
          const backoff = retryDelayMs * Math.pow(backoffMultiplier, attempt - 1);
          await sleep(backoff);
          continue;
        }
      }
    }

    logger.error?.("api-client failure", { url, error: lastError?.message, status: lastStatus });
    return {
      status: "error",
      statusCode: lastStatus || 0,
      error: lastError?.message || "Request failed",
    };
  }

  return {
    request,
    get: (path, options) => request(path, { ...options, method: "GET" }),
    post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  };
}

module.exports = {
  createApiClient,
  normalizePath,
  buildUrl,
};
