// Centralized API client.
// - Base URL, JSON headers, JWT injection from localStorage
// - Uniform error handling via ApiError
// - `MOCK_API` flag lets every service dispatch to a mock handler today
//   and a real fetch tomorrow with no signature changes.

const TOKEN_KEY = "gymbro_jwt";

import { refreshTokenStorage } from "./refreshTokenStorage";

export const API_BASE_URL: string =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) ||
  "https://api.gymbro.app";

export const MOCK_API: boolean =
  ((typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_MOCK_API) ?? "true") !== "false";

export class ApiError extends Error {
  status: number;
  data?: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean;
  // Fallback used while MOCK_API is true. The function receives the parsed
  // request and returns the mock response. Each service supplies its own.
  mock?: () => Promise<unknown> | unknown;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path.replace(/^\//, ""), API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function delay(ms = 200): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function request<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, auth = true, mock } = opts;

  if (MOCK_API && mock) {
    await delay();
    return (await mock()) as T;
  }

  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
  const token = tokenStorage.get();
  if (auth && token && token !== "undefined" && token !== "null") {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    // If unauthorized and this was an authenticated request, try refreshing once.
    if (res.status === 401 && auth) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry original request with new token
        const retryHeaders: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
        const token2 = tokenStorage.get();
        if (auth && token2 && token2 !== "undefined" && token2 !== "null") {
          retryHeaders.Authorization = `Bearer ${token2}`;
        }
        const res2 = await fetch(buildUrl(path, query), {
          method,
          headers: retryHeaders,
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        const text2 = await res2.text();
        const data2 = text2 ? safeJson(text2) : null;
        if (!res2.ok) {
          throw new ApiError(res2.status, (data2 as any)?.detail ?? res2.statusText, data2);
        }
        return data2 as T;
      }
    }
    throw new ApiError(res.status, (data as any)?.detail ?? res.statusText, data);
  }
  return data as T;
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = refreshTokenStorage.get();
  if (!refresh) return false;
  try {
    const res = await fetch(buildUrl("users/auth/refresh/"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh }),
    });
    const text = await res.text();
    const data = text ? safeJson(text) : null;
    if (!res.ok) {
      tokenStorage.clear();
      refreshTokenStorage.clear();
      return false;
    }
    if ((data as any)?.access) tokenStorage.set((data as any).access);
    if ((data as any)?.refresh) refreshTokenStorage.set((data as any).refresh);
    return true;
  } catch (err) {
    tokenStorage.clear();
    refreshTokenStorage.clear();
    return false;
  }
}

function safeJson(text: string): unknown {
  try { return JSON.parse(text); } catch { return text; }
}

export const apiClient = { request, tokenStorage, ApiError };
