import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../lib/config";

let accessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 - try refresh
  if (response.status === 401) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            headers["Authorization"] = `Bearer ${token}`;
            resolve(
              fetch(url, { ...options, headers }).then((res) => res.json())
            );
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");

      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshRes.ok) throw new Error("Refresh failed");

      const data = await refreshRes.json();
      accessToken = data.accessToken;
      await SecureStore.setItemAsync("refreshToken", data.refreshToken);

      processQueue(null, accessToken);

      headers["Authorization"] = `Bearer ${accessToken}`;
      response = await fetch(url, { ...options, headers });
    } catch (err) {
      processQueue(err, null);
      await SecureStore.deleteItemAsync("refreshToken");
      accessToken = null;
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Something went wrong");
  }

  // Handle empty response
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}