const baseUrl = (process.env.NEXT_PUBLIC_CIMEIKA_API_URL || "").replace(/\/$/, "");

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${baseUrl}${path}`;

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

    const data = (await response.json()) as T;
    return { data };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("Cimeika API client error", error);
    } else {
      // TODO: send critical frontend errors to monitoring endpoint
    }
    return { error: "unavailable" };
  }
}

export async function get<T>(path: string): Promise<ApiResponse<T>> {
  return request<T>(path, { method: "GET" });
}

export async function post<TBody, TResponse>(
  path: string,
  body: TBody,
): Promise<ApiResponse<TResponse>> {
  return request<TResponse>(path, { method: "POST", body: JSON.stringify(body) });
}
