export default defineNuxtRouteMiddleware(() => {
  if (import.meta.client) {
    const authStore = useAuthStore();
    if (authStore.isAuthenticated) {
      return navigateTo('/');
    }
  }
});
