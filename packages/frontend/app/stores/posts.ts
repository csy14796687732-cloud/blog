import { defineStore } from 'pinia';
import type { PostWithRelations } from '@blog/shared/types';

interface PostsState {
  posts: PostWithRelations[];
  currentPost: PostWithRelations | null;
  featuredPosts: PostWithRelations[];
  relatedPosts: PostWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
}

export const usePostsStore = defineStore('posts', {
  state: (): PostsState => ({
    posts: [],
    currentPost: null,
    featuredPosts: [],
    relatedPosts: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    loading: false,
  }),

  getters: {
    isLoading: (state) => state.loading,
    isEmpty: (state) => state.posts.length === 0 && !state.loading,
  },

  actions: {
    async fetchPosts(params?: Record<string, string | number>) {
      this.loading = true;
      try {
        const config = useRuntimeConfig();
        const query = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value) query.set(key, String(value));
          });
        }

        const res = await fetch(`${config.public.apiBase}/posts?${query}`);
        const json = await res.json();
        if (json.success && json.data) {
          this.posts = json.data.items;
          this.total = json.data.total;
          this.page = json.data.page;
          this.pageSize = json.data.pageSize;
          this.totalPages = json.data.totalPages;
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchFeaturedPosts() {
      try {
        const config = useRuntimeConfig();
        const res = await fetch(`${config.public.apiBase}/posts/featured`);
        const json = await res.json();
        if (json.success) {
          this.featuredPosts = json.data;
        }
      } catch (e) {
        console.error('Failed to fetch featured posts', e);
      }
    },

    async fetchPostBySlug(slug: string) {
      this.loading = true;
      try {
        const config = useRuntimeConfig();
        const res = await fetch(`${config.public.apiBase}/posts/slug/${slug}`);
        const json = await res.json();
        if (json.success) {
          this.currentPost = json.data;
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchRelatedPosts(postId: string) {
      try {
        const config = useRuntimeConfig();
        const res = await fetch(`${config.public.apiBase}/posts/${postId}/related`);
        const json = await res.json();
        if (json.success) {
          this.relatedPosts = json.data;
        }
      } catch (e) {
        console.error('Failed to fetch related posts', e);
      }
    },

    async searchPosts(query: string, page = 1) {
      this.loading = true;
      try {
        const config = useRuntimeConfig();
        const res = await fetch(
          `${config.public.apiBase}/search?q=${encodeURIComponent(query)}&page=${page}`,
        );
        const json = await res.json();
        if (json.success && json.data) {
          this.posts = json.data.items;
          this.total = json.data.total;
          this.page = json.data.page;
          this.totalPages = json.data.totalPages;
        }
      } finally {
        this.loading = false;
      }
    },

    clearCurrentPost() {
      this.currentPost = null;
      this.relatedPosts = [];
    },
  },
});
