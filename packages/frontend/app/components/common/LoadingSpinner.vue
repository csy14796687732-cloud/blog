<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <svg
      class="animate-spin"
      :class="sizeClass"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
    <span v-if="text" class="ml-3 text-sm text-slate-500">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullPage?: boolean;
  }>(),
  {
    size: 'md',
    text: '',
    fullPage: false,
  },
);

const sizeClass = computed(() => {
  switch (size) {
    case 'sm':
      return 'h-5 w-5';
    case 'lg':
      return 'h-10 w-10';
    default:
      return 'h-6 w-6';
  }
});

const containerClass = computed(() => {
  return fullPage ? 'min-h-[60vh]' : 'py-8';
});
</script>
