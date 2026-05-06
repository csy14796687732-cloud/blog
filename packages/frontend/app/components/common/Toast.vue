<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all"
        :class="toastClass(toast.type)"
      >
        <span>{{ toast.message }}</span>
        <button
          class="ml-2 opacity-70 hover:opacity-100"
          @click="uiStore.removeToast(toast.id)"
        >
          &times;
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const uiStore = useUiStore();

function toastClass(type: string) {
  switch (type) {
    case 'success':
      return 'bg-green-600 text-white';
    case 'error':
      return 'bg-red-600 text-white';
    case 'warning':
      return 'bg-yellow-500 text-white';
    default:
      return 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-800';
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
