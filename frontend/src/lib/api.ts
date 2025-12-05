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

const baseUrl = resolveBaseUrl();

const normalizePath = (path: string) => (path.startsWith("/") ? path : `/${path}`);

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  validate?: (data: unknown) => T,
): Promise<ApiResponse<T>> {
  const url = `${baseUrl}${normalizePath(path)}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      return { error: `Request failed with status ${response.status}` };
    }

    const payload = await response.json();
    const parsed = validate ? validate(payload) : (payload as T);
    return { data: parsed };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Cimeika API client error", error);
    } else {
      // TODO: send critical frontend errors to monitoring endpoint
    }
    return { error: "unavailable" };
  }
}

export async function get<T>(path: string, validate?: (data: unknown) => T): Promise<ApiResponse<T>> {
  return request<T>(path, { method: "GET" }, validate);
}

export async function post<TBody, TResponse>(
  path: string,
  body: TBody,
  validate?: (data: unknown) => TResponse,
): Promise<ApiResponse<TResponse>> {
  return request<TResponse>(path, { method: "POST", body: JSON.stringify(body) }, validate);
}
