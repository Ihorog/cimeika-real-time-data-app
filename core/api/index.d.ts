export type ApiResult<T = any> = { status: "ok"; data: T; statusCode?: number } | { status: "error"; error: string; statusCode?: number };

export interface ApiClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  backoffMultiplier?: number;
  criticalRetries?: number;
  defaultHeaders?: Record<string, string>;
  fetchImpl?: typeof fetch;
  logger?: Console;
  onError?: (message: string, payload?: Record<string, unknown>) => void;
}

export interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  asJson?: boolean;
  retry?: number;
  critical?: boolean;
}

export interface ApiClient {
  request: <T = any>(path: string, options?: RequestOptions) => Promise<ApiResult<T>>;
  get: <T = any>(path: string, options?: RequestOptions) => Promise<ApiResult<T>>;
  post: <T = any>(path: string, body?: unknown, options?: RequestOptions) => Promise<ApiResult<T>>;
}

export function createApiClient(options?: ApiClientOptions): ApiClient;
export function normalizePath(path?: string): string;
export function buildUrl(baseUrl: string, path: string): string;
