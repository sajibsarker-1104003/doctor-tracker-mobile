// src/lib/api-client.ts
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type Json = Record<string, unknown> | undefined;

/* ---------------- token storage ---------------- */
const STORAGE_KEY = "dt_access_token";

let memoryToken: string | null = null;

export const setInMemoryToken = (t: string | null) => {
  memoryToken = t;
  if (typeof window !== "undefined") {
    if (t) sessionStorage.setItem(STORAGE_KEY, t);
    else sessionStorage.removeItem(STORAGE_KEY);
  }
};

export const getInMemoryToken = (): string | null => {
  if (memoryToken) return memoryToken;
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      memoryToken = stored;
      return stored;
    }
  }
  return null;
};

/* ---------------- cookie helpers ---------------- */
export function getRefreshTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)refreshToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function persistSessionCookie(refreshToken?: string) {
  if (typeof document === "undefined") return;
  if (refreshToken) {
    document.cookie = `refreshToken=${encodeURIComponent(
      refreshToken
    )}; path=/; max-age=604800; samesite=lax`;
  }
  document.cookie = `session=1; path=/; max-age=604800; samesite=lax`;
}

export function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "refreshToken=; path=/; max-age=0; samesite=lax";
  document.cookie = "session=; path=/; max-age=0; samesite=lax";
}

/* ---------------- refresh mutex ---------------- */
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function performRefresh(): Promise<{
  accessToken: string | null;
  refreshToken?: string;
}> {
  const refreshToken = getRefreshTokenFromCookie();
  if (!refreshToken) return { accessToken: null };

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return { accessToken: null };
    const data = (await res.json()) as {
      accessToken?: string;
      refreshToken?: string;
    };
    return {
      accessToken: data.accessToken ?? null,
      refreshToken: data.refreshToken,
    };
  } catch {
    return { accessToken: null };
  }
}

/**
 * Get a fresh access token, coordinating across concurrent callers.
 * Used by both apiClient on 401 AND by AuthProvider on mount.
 */
export async function getFreshAccessToken(): Promise<string | null> {
  const existing = getInMemoryToken();
  if (existing) return existing;

  if (isRefreshing) {
    return new Promise<string | null>((resolve) => refreshQueue.push(resolve));
  }

  isRefreshing = true;
  const { accessToken, refreshToken } = await performRefresh();
  isRefreshing = false;

  const queue = refreshQueue;
  refreshQueue = [];
  queue.forEach((cb) => cb(accessToken));

  if (!accessToken) {
    clearSessionCookie();
    return null;
  }

  setInMemoryToken(accessToken);
  persistSessionCookie(refreshToken);
  return accessToken;
}

/* ---------------- main request ---------------- */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: Omit<RequestInit, "body"> & { body?: Json; skipRefresh?: boolean } = {}
): Promise<T> {
  const { body, headers, skipRefresh, ...rest } = options;

  const doFetch = (token?: string | null) =>
    fetch(`${API_BASE}${endpoint}`, {
      ...rest,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers as Record<string, string> | undefined),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

  let response = await doFetch(getInMemoryToken());

  if (
    response.status === 401 &&
    !skipRefresh &&
    !endpoint.startsWith("/auth/login") &&
    !endpoint.startsWith("/auth/refresh")
  ) {
    const newToken = await getFreshAccessToken();
    if (!newToken) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.href = "/login";
      }
      throw new ApiError(401, "Session expired");
    }
    response = await doFetch(newToken);
  }

  let payload: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const errPayload = payload as
      | { message?: string | string[]; statusCode?: number }
      | null;
    const message =
      (Array.isArray(errPayload?.message)
        ? errPayload.message.join(", ")
        : errPayload?.message) ?? `Request failed (${response.status})`;
    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
}

export const api = {
  get: <T>(url: string) => apiClient<T>(url),
  post: <T>(url: string, body?: Json) => apiClient<T>(url, { method: "POST", body }),
  patch: <T>(url: string, body?: Json) =>
    apiClient<T>(url, { method: "PATCH", body }),
  delete: <T>(url: string) => apiClient<T>(url, { method: "DELETE" }),
};