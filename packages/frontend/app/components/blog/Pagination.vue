<template>
  <nav v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2" aria-label="分页导航">
    <button
      :disabled="currentPage <= 1"
      class="rounded-lg px-3 py-2 text-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-700"
      @click="goTo(currentPage - 1)"
    >
      上一页
    </button>

    <template v-for="page in pages" :key="page">
      <span v-if="page === '...'" class="px-2 text-slate-400">...</span>
      <button
        v-else
        class="rounded-lg px-3 py-2 text-sm font-medium transition"
        :class="
          page === currentPage
            ? 'bg-primary-600 text-white'
            : 'hover:bg-slate-100 dark:hover:bg-slate-700'
        "
        @click="goTo(page as number)"
      >
        {{ page }}
      </button>
    </template>

    <button
      :disabled="currentPage >= totalPages"
      class="rounded-lg px-3 py-2 text-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-700"
      @click="goTo(currentPage + 1)"
    >
      下一页
    </button>
  </nav>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    currentPage: number;
    totalPages: number;
  }>(),
  {
    currentPage: 1,
    totalPages: 1,
  },
);

const emit = defineEmits<{
  'page-change': [page: number];
}>();

const pages = computed(() => {
  const items: (number | string)[] = [];
  const total = props.totalPages;
  const current = props.currentPage;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) items.push(i);
    return items;
  }

  items.push(1);

  if (current > 3) items.push('...');

  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    items.push(i);
  }

  if (current < total - 2) items.push('...');

  items.push(total);

  return items;
});

function goTo(page: number) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page);
  }
}
</script>
