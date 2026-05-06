<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="uiStore.confirmDialog.show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <div class="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800">
          <h3 class="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
            {{ uiStore.confirmDialog.title }}
          </h3>
          <p class="mb-6 text-sm text-slate-600 dark:text-slate-300">
            {{ uiStore.confirmDialog.message }}
          </p>
          <div class="flex justify-end gap-3">
            <Button variant="secondary" @click="uiStore.confirmAction(false)">
              取消
            </Button>
            <Button variant="danger" @click="uiStore.confirmAction(true)">
              确认
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const uiStore = useUiStore();
</script>
