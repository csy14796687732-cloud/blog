<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold text-slate-800 dark:text-slate-100">
      {{ pageTitle }}
    </h1>

    <!-- Filters -->
    <div class="mb-8 flex flex-wrap items-center gap-4">
      <SearchBar v-model="searchQuery" @search="doSearch" />
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          to="/posts"
          class="rounded-full px-3 py-1.5 text-sm transition"
          :class="activeFilter === 'all'
            ? 'bg-primary-600 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'"
        >
          全部
        </NuxtLink>
        <NuxtLink
          v-for="cat in categories"
          :key="cat.id"
          :to="`/posts?category=${cat.slug}`"
          class="rounded-full px-3 py-1.5 text-sm transition"
          :class="activeCategory === cat.slug
            ? 'bg-primary-600 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'"
        >
          {{ cat.name }}
        </NuxtLink>
      </div>
    </div>

    <!-- Posts Grid -->
    <LoadingSpinner v-if="postsStore.isLoading" />

    <EmptyState
      v-else-if="postsStore.posts.length === 0"
      title="没有找到文章"
      description="换个分类试试，或者搜索其他关键词"
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
import type { Category } from '@blog/shared/types';

const postsStore = usePostsStore();
const route = useRoute();
const router = useRouter();

const categories = ref<Category[]>([]);
const searchQuery = ref('');
const activeFilter = ref('all');
const activeCategory = ref('');

usePageMeta('文章', '浏览全部文章');

const pageTitle = computed(() => {
  if (route.query.category) return `分类：${route.query.category}`;
  if (route.query.tag) return `标签：${route.query.tag}`;
  if (route.query.q) return `搜索：${route.query.q}`;
  return '全部文章';
});

async function loadPosts() {
  const params: Record<string, string | number> = {
    page: parseInt((route.query.page as string) || '1', 10),
    pageSize: 12,
  };

  if (route.query.category) {
    params.category = route.query.category as string;
    activeCategory.value = route.query.category as string;
    activeFilter.value = route.query.category as string;
  }
  if (route.query.tag) {
    params.tag = route.query.tag as string;
  }
  if (route.query.q) {
    params.search = route.query.q as string;
    searchQuery.value = route.query.q as string;
  }

  await postsStore.fetchPosts(params);
}

function onPageChange(page: number) {
  router.push({ query: { ...route.query, page: String(page) } });
}

function doSearch() {
  if (searchQuery.value.trim()) {
    router.push({ query: { q: searchQuery.value.trim() } });
  }
}

onMounted(async () => {
  await loadPosts();
  try {
    const config = useRuntimeConfig();
    const res = await fetch(`${config.public.apiBase}/categories`);
    const json = await res.json();
    if (json.success) {
      categories.value = json.data;
    }
  } catch (e) {
    console.error('Failed to fetch categories', e);
  }
});

watch(
  () => route.query,
  () => {
    loadPosts();
  },
);
</script>
