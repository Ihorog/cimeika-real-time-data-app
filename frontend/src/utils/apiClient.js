const DEFAULT_API_BASE = "http://localhost:3000/api/v1";
const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, "");

const buildUrl = (endpoint) => {
  const normalized = endpoint.replace(/^\//, "");
  return `${apiBase}/${normalized}`;
};

export const api = async (endpoint, options = {}) => {
  const url = buildUrl(endpoint);
  let response;

  try {
    response = await fetch(url, { cache: "no-store", ...options });
  } catch (error) {
    throw new Error(`Failed to reach API at ${url}: ${error.message}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error(`Unable to parse API response from ${url}: ${error.message}`);
  }

  if (!response.ok) {
    const message = payload?.message || response.statusText;
    throw new Error(`API request failed (${response.status}): ${message}`);
  }

  return payload;
};
