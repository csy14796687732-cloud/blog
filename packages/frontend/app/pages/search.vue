<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold text-slate-800 dark:text-slate-100">
      搜索：{{ query }}
    </h1>

    <div class="mb-8">
      <SearchBar v-model="searchQuery" @search="doSearch" />
    </div>

    <LoadingSpinner v-if="postsStore.isLoading" />

    <EmptyState
      v-else-if="postsStore.posts.length === 0"
      title="没有找到匹配的文章"
      :description="`未找到包含"${query}"的文章`"
    />

    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <PostCard
        v-for="post in postsStore.posts"
        :key="post.id"
        :post="post"
      />
    </div>

    <Pagination
      :current-page="postsStore.page"
      :total-pages="postsStore.totalPages"
      @page-change="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
const postsStore = usePostsStore();
const route = useRoute();
const router = useRouter();

const query = computed(() => (route.query.q as string) || '');
const searchQuery = ref(query.value);

usePageMeta(`搜索：${query.value}`, `搜索文章：${query.value}`);

function doSearch() {
  if (searchQuery.value.trim()) {
    router.push({ query: { q: searchQuery.value.trim() } });
  }
}

function onPageChange(page: number) {
  router.push({ query: { q: query.value, page: String(page) } });
}

watch(
  () => route.query,
  (newQuery) => {
    const q = (newQuery.q as string) || '';
    if (q) {
      postsStore.searchPosts(q, parseInt((newQuery.page as string) || '1', 10));
    }
  },
  { immediate: true },
);
</script>
