import { defineStore } from 'pinia';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface UiState {
  toasts: ToastMessage[];
  globalLoading: boolean;
  confirmDialog: {
    show: boolean;
    title: string;
    message: string;
    resolve: ((value: boolean) => void) | null;
  };
}

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    toasts: [],
    globalLoading: false,
    confirmDialog: {
      show: false,
      title: '',
      message: '',
      resolve: null,
    },
  }),

  actions: {
    showToast(type: ToastMessage['type'], message: string, duration = 3000) {
      const id = Math.random().toString(36).substring(2);
      this.toasts.push({ id, type, message });
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    },

    removeToast(id: string) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    },

    setLoading(val: boolean) {
      this.globalLoading = val;
    },

    showConfirm(title: string, message: string): Promise<boolean> {
      return new Promise((resolve) => {
        this.confirmDialog = {
          show: true,
          title,
          message,
          resolve,
        };
      });
    },

    async confirmAction(confirmed: boolean) {
      if (this.confirmDialog.resolve) {
        this.confirmDialog.resolve(confirmed);
      }
      this.confirmDialog = {
        show: false,
        title: '',
        message: '',
        resolve: null,
      };
    },
  },
});
