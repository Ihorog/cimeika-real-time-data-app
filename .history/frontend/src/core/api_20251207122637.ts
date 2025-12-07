// frontend/src/core/api.ts

export type ApiResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export type ApiClientConfig = {
  baseUrl?: string;
  timeoutMs?: number;       // загальний таймаут/базова затримка
  retries?: number;         // кількість повторних спроб
  retryDelayMs?: number;    // пауза між ретраями
  criticalRetries?: number; // зарезервовано під "критичні" ретраї (поки не використовується окремо)
};

function resolveBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_CIMEIKA_API_URL;
  if (!raw) {
    throw new Error("NEXT_PUBLIC_CIMEIKA_API_URL is not defined");
  }
  const url = raw.trim();
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function createApiClient(config?: ApiClientConfig) {
  const baseUrl = config?.baseUrl ?? resolveBaseUrl();
  const timeoutMs = config?.timeoutMs ?? 6000;
  const retries = config?.retries ?? 1;
  const retryDelayMs = config?.retryDelayMs ?? timeoutMs;
  // criticalRetries поки не використовуємо окремо, але тип його вже знає
  // const criticalRetries = config?.criticalRetries ?? retries;

  async function request<T>(
    method: "GET" | "POST",
    path: string,
    body?: unknown
  ): Promise<ApiResult<T>> {
    const url = `${baseUrl}${path}`;
    let attempt = 0;

    while (true) {
      try {
        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: body != null ? JSON.stringify(body) : undefined,
          cache: "no-store",
        });

        if (!res.ok) {
          return { ok: false, error: `HTTP ${res.status}` };
        }

        const data = (await res.json()) as T;
        return { ok: true, data };
      } catch (err) {
        if (attempt >= retries) {
          return {
            ok: false,
            error: err instanceof Error ? err.message : "Network error",
          };
        }
        attempt += 1;

        if (retryDelayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }
      }
    }
  }

  function get<T>(path: string): Promise<ApiResult<T>> {
    return request<T>("GET", path);
  }

  function post<T>(path: string, body: unknown): Promise<ApiResult<T>> {
    return request<T>("POST", path, body);
  }

  return { get, post };
}
