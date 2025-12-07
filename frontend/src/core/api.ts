export * from "../../.// src/core/api.ts

export type ApiResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

function resolveBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_CIMEIKA_API_URL?.trim();
  if (!url) throw new Error("NEXT_PUBLIC_CIMEIKA_API_URL is not defined");
  return url.replace(/\/$/, "");
}

export function createApiClient() {
  const baseUrl = resolveBaseUrl();

  async function get<T>(path: string): Promise<ApiResult<T>> {
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        return { ok: false, error: `HTTP ${res.status}` };
      }

      const data = (await res.json()) as T;
      return { ok: true, data };
    } catch (err: any) {
      return { ok: false, error: err?.message || "Network error" };
    }
  }

  async function post<T>(path: string, body: any): Promise<ApiResult<T>> {
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });

      if (!res.ok) {
        return { ok: false, error: `HTTP ${res.status}` };
      }

      const data = (await res.json()) as T;
      return { ok: true, data };
    } catch (err: any) {
      return { ok: false, error: err?.message || "Network error" };
    }
  }

  return { get, post };
}
./core/api";
