import { createApiClient, type ApiResult } from "@/core/api";

function resolveBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_CIMEIKA_API_URL?.trim();
  if (!url) {
    const fallback = "http://localhost:8000";
    console.warn(
      `NEXT_PUBLIC_CIMEIKA_API_URL is not configured; defaulting to ${fallback} for ${process.env.NODE_ENV ?? "development"}`,
    );
    return fallback;
  }
  return url.replace(/\/$/, "");
}

const client = createApiClient({
  baseUrl: resolveBaseUrl(),
  timeoutMs: 6000,
  retries: 1,
  retryDelayMs: 200,
  criticalRetries: 3,
});

export async function get<T>(path: string): Promise<ApiResult<T>> {
  return client.get<T>(path, { critical: true });
}

export async function post<TBody, TResponse>(path: string, body: TBody): Promise<ApiResult<TResponse>> {
  return client.post<TResponse>(path, body, { critical: true });
}
