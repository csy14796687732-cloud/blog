import { useRuntimeConfig } from '#app';

export function useApi() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase;

  const authStore = useAuthStore();

  async function request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ success: boolean; message: string; data?: T }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }

    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json();

    if (!res.ok && res.status === 401 && authStore.token) {
      authStore.logout();
    }

    return json;
  }

  return {
    get: <T>(endpoint: string) =>
      request<T>(endpoint),

    post: <T>(endpoint: string, data?: unknown) =>
      request<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      }),

    put: <T>(endpoint: string, data?: unknown) =>
      request<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      }),

    delete: <T>(endpoint: string) =>
      request<T>(endpoint, { method: 'DELETE' }),
  };
}
