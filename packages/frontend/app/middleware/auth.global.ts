export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.client) {
    const authStore = useAuthStore();
    if (!authStore.user && authStore.token) {
      try {
        await authStore.fetchUser();
      } catch {
        authStore.logout();
      }
    }
  }
});
