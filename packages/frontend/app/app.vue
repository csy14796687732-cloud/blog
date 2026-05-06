<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/theme';

const themeStore = useThemeStore();

onMounted(() => {
  themeStore.init();
});
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
