import { defineStore } from 'pinia';
import type { UserPublic, AuthResponse, LoginRequest, RegisterRequest } from '@blog/shared/types';
import { useRuntimeConfig } from '#app';

interface AuthState {
  user: UserPublic | null;
  token: string | null;
  loading: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isAuthLoading: (state) => state.loading,
  },

  actions: {
    async init() {
      if (import.meta.client) {
        const token = localStorage.getItem('blog-auth-token');
        if (token) {
          this.token = token;
          try {
            await this.fetchUser();
          } catch {
            this.logout();
          }
        }
      }
    },

    async login(data: LoginRequest) {
      const config = useRuntimeConfig();
      this.loading = true;
      try {
        const res = await fetch(`${config.public.apiBase}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const authData = json.data as AuthResponse;
        this.token = authData.token;
        this.user = authData.user;

        if (import.meta.client) {
          localStorage.setItem('blog-auth-token', authData.token);
        }

        return authData;
      } finally {
        this.loading = false;
      }
    },

    async register(data: RegisterRequest) {
      const config = useRuntimeConfig();
      this.loading = true;
      try {
        const res = await fetch(`${config.public.apiBase}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const authData = json.data as AuthResponse;
        this.token = authData.token;
        this.user = authData.user;

        if (import.meta.client) {
          localStorage.setItem('blog-auth-token', authData.token);
        }

        return authData;
      } finally {
        this.loading = false;
      }
    },

    async fetchUser() {
      const config = useRuntimeConfig();
      const res = await fetch(`${config.public.apiBase}/auth/me`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        this.user = json.data;
      }
    },

    async updateProfile(data: { display_name?: string; bio?: string; avatar?: string }) {
      const config = useRuntimeConfig();
      const res = await fetch(`${config.public.apiBase}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        this.user = json.data;
      }
      return json;
    },

    async changePassword(currentPassword: string, newPassword: string) {
      const config = useRuntimeConfig();
      const res = await fetch(`${config.public.apiBase}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      return await res.json();
    },

    logout() {
      this.user = null;
      this.token = null;
      if (import.meta.client) {
        localStorage.removeItem('blog-auth-token');
      }
      navigateTo('/');
    },
  },
});
