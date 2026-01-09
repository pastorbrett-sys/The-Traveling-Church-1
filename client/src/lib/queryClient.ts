import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { Capacitor } from '@capacitor/core';

// Production server URL for native apps
const PRODUCTION_URL = 'https://the-traveling-church-brettlindstrom.replit.app';

// Evaluate platform at call time, not module initialization time
export function getApiUrl(url: string): string {
  if (url.startsWith('/')) {
    // Check native platform at runtime when Capacitor is ready
    const isNative = Capacitor.isNativePlatform();
    const baseUrl = isNative ? PRODUCTION_URL : '';
    return `${baseUrl}${url}`;
  }
  return url;
}

// Helper for direct fetch calls that need the correct API URL
export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const fullUrl = getApiUrl(url);
  const defaultOptions: RequestInit = {
    credentials: "include",
  };
  return fetch(fullUrl, { ...defaultOptions, ...options });
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(getApiUrl(url), {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const res = await fetch(getApiUrl(url), {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
