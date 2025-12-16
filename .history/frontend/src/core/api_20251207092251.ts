// src/core/api.ts

export type ApiResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

function resolveBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_CIMEIKA_API_URL;
  if (!raw) {
    throw new Error("NEXT_PUBLIC_CIMEIKA_API_URL is not defined");
  }
  const url = raw.trim();
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function createApiClient() {
  const baseUrl = resolveBaseUrl();

  async function get<T>(path: string): Promise<ApiResult<T>> {
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        return { ok: false, error: `HTTP ${res.status}` };
      }

      const data = (await res.json()) as T;
      return { ok: true, data };
    } catch (err: unknown) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Network error",
      };
    }
  }

  async function post<T>(path: string, body: unknown): Promise<ApiResult<T>> {
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      });

      if (!res.ok) {
        return { ok: false, error: `HTTP ${res.status}` };
      }

      const data = (await res.json()) as T;
      return { ok: true, data };
    } catch (err: unknown) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Network error",
      };
    }
  }

  return { get, post };
}
