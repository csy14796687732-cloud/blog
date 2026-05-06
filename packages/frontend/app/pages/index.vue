<template>
  <div>
    <!-- Hero Section -->
    <section class="border-b bg-gradient-to-br from-primary-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div class="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 class="mb-4 text-4xl font-bold text-slate-800 dark:text-slate-100 md:text-5xl">
          个人博客
        </h1>
        <p class="mx-auto mb-8 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
          分享技术与生活，记录成长的点滴
        </p>
        <div class="flex items-center justify-center gap-4">
          <NuxtLink
            to="/posts"
            class="rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700"
          >
            浏览文章
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="rounded-lg border px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            关于我
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Featured Posts -->
    <section v-if="postsStore.featuredPosts.length > 0" class="mx-auto max-w-6xl px-4 py-12">
      <h2 class="mb-8 text-2xl font-bold text-slate-800 dark:text-slate-100">
        精选文章
      </h2>
      <div class="grid gap-6 md:grid-cols-3">
        <PostCard
          v-for="post in postsStore.featuredPosts"
          :key="post.id"
          :post="post"
        />
      </div>
    </section>

    <!-- Latest Posts -->
    <section class="mx-auto max-w-6xl px-4 py-12">
      <div class="mb-8 flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">
          最新文章
        </h2>
        <NuxtLink
          to="/posts"
          class="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          查看全部 &rarr;
        </NuxtLink>
      </div>

      <LoadingSpinner v-if="postsStore.isLoading" />

      <div v-else-if="postsStore.posts.length === 0">
        <EmptyState title="暂无文章" description="还没有发表任何文章" />
      </div>

      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PostCard
          v-for="post in postsStore.posts"
          :key="post.id"
          :post="post"
        />
      </div>
    </section>

    <!-- Categories Section -->
    <section class="border-t bg-slate-50 py-12 dark:bg-slate-800/50">
      <div class="mx-auto max-w-6xl px-4">
        <h2 class="mb-8 text-center text-2xl font-bold text-slate-800 dark:text-slate-100">
          文章分类
        </h2>
        <LoadingSpinner v-if="loadingCategories" size="sm" />
        <div v-else class="flex flex-wrap justify-center gap-4">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.id"
            :to="`/posts?category=${cat.slug}`"
            class="rounded-lg border bg-white px-6 py-3 text-center transition hover:border-primary-500 hover:text-primary-600 dark:bg-slate-700 dark:hover:border-primary-400"
          >
            <div class="text-sm font-medium">{{ cat.name }}</div>
            <div class="mt-1 text-xs text-slate-400">{{ cat.post_count }} 篇文章</div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '@blog/shared/types';

const postsStore = usePostsStore();
const loadingCategories = ref(true);
const categories = ref<Category[]>([]);

usePageMeta('', '个人博客 - 分享技术与生活');

onMounted(async () => {
  await Promise.all([
    postsStore.fetchFeaturedPosts(),
    postsStore.fetchPosts({ pageSize: 6 }),
    fetchCategories(),
  ]);
});

async function fetchCategories() {
  try {
    const config = useRuntimeConfig();
    const res = await fetch(`${config.public.apiBase}/categories`);
    const json = await res.json();
    if (json.success) {
      categories.value = json.data;
    }
  } catch (e) {
    console.error('Failed to fetch categories', e);
  } finally {
    loadingCategories.value = false;
  }
}
</script>
