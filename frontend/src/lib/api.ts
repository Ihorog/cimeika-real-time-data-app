import { createApiClient, type ApiResult } from "../../../core/api";

function resolveBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_CIMEIKA_API_URL?.trim();
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXT_PUBLIC_CIMEIKA_API_URL is required in production environments");
    }

    console.warn(
      "NEXT_PUBLIC_CIMEIKA_API_URL is not configured; defaulting to http://localhost:8000 for local development",
    );
    return "http://localhost:8000";
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
