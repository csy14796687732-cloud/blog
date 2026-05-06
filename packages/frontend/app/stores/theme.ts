import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false,
  }),

  actions: {
    init() {
      const saved = localStorage.getItem('blog-color-mode');
      if (saved === 'dark') {
        this.isDark = true;
        document.documentElement.classList.add('dark');
      } else if (saved === 'light') {
        this.isDark = false;
        document.documentElement.classList.remove('dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDark = prefersDark;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        }
      }
    },

    toggle() {
      this.isDark = !this.isDark;
      if (this.isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('blog-color-mode', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('blog-color-mode', 'light');
      }
    },
  },
});
