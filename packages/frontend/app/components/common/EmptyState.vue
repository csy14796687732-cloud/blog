<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <svg
      class="mb-4 h-16 w-16 text-slate-300 dark:text-slate-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
    <h3 class="mb-2 text-lg font-medium text-slate-600 dark:text-slate-300">
      {{ title }}
    </h3>
    <p v-if="description" class="text-sm text-slate-400">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description?: string;
  }>(),
  {
    description: '',
  },
);
</script>
