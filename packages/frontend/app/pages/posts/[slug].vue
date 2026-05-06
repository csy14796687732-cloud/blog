<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <LoadingSpinner v-if="loading" />

    <template v-else-if="post">
      <!-- Breadcrumb -->
      <nav class="mb-6 text-sm text-slate-400">
        <NuxtLink to="/" class="hover:text-primary-600">首页</NuxtLink>
        <span class="mx-2">/</span>
        <NuxtLink to="/posts" class="hover:text-primary-600">文章</NuxtLink>
        <span class="mx-2">/</span>
        <span class="text-slate-600 dark:text-slate-300">{{ post.title }}</span>
      </nav>

      <article>
        <!-- Cover Image -->
        <div v-if="post.cover_image" class="mb-8 overflow-hidden rounded-lg">
          <img
            :src="post.cover_image"
            :alt="post.title"
            class="w-full object-cover"
            loading="lazy"
          />
        </div>

        <!-- Category -->
        <div class="mb-4">
          <NuxtLink
            v-if="post.category"
            :to="`/posts?category=${post.category.slug}`"
            class="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
          >
            {{ post.category.name }}
          </NuxtLink>
        </div>

        <!-- Title -->
        <h1 class="mb-4 text-3xl font-bold text-slate-800 dark:text-slate-100 md:text-4xl">
          {{ post.title }}
        </h1>

        <!-- Meta -->
        <div class="mb-8 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span class="flex items-center gap-1">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {{ post.author.display_name }}
          </span>
          <span>{{ formatDate(post.published_at || post.created_at) }}</span>
          <span class="flex items-center gap-1">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {{ post.view_count }} 阅读
          </span>
          <button
            class="flex items-center gap-1 transition hover:text-red-500"
            :class="{ 'text-red-500': isLiked }"
            @click="toggleLike"
          >
            <svg class="h-4 w-4" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {{ likeCount }}
          </button>
        </div>

        <!-- Tags -->
        <div v-if="post.tags?.length" class="mb-8 flex flex-wrap gap-2">
          <NuxtLink
            v-for="tag in post.tags"
            :key="tag.id"
            :to="`/posts?tag=${tag.slug}`"
            class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 transition hover:bg-primary-100 hover:text-primary-600 dark:bg-slate-700 dark:text-slate-400"
          >
            # {{ tag.name }}
          </NuxtLink>
        </div>

        <!-- Content -->
        <div class="prose-custom mb-12" v-html="renderedContent" />

        <!-- Share -->
        <div class="mb-12 border-t pt-6">
          <ShareButtons :title="post.title" :url="currentUrl" />
        </div>

        <!-- Comments -->
        <div class="border-t pt-8">
          <h2 class="mb-6 text-xl font-bold text-slate-800 dark:text-slate-100">
            评论 ({{ commentCount }})
          </h2>
          <CommentSection :post-id="post.id" />
        </div>
      </article>

      <!-- Related Posts -->
      <aside v-if="postsStore.relatedPosts.length > 0" class="mt-16 border-t pt-8">
        <h2 class="mb-6 text-xl font-bold text-slate-800 dark:text-slate-100">
          相关文章
        </h2>
        <div class="grid gap-6 md:grid-cols-3">
          <PostCard
            v-for="related in postsStore.relatedPosts"
            :key="related.id"
            :post="related"
          />
        </div>
      </aside>
    </template>

    <div v-else-if="!loading" class="py-16 text-center">
      <EmptyState title="文章不存在" description="请检查链接是否正确" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormatDate } from '~/composables/useFormatDate';

const route = useRoute();
const postsStore = usePostsStore();
const authStore = useAuthStore();
const uiStore = useUiStore();

const post = computed(() => postsStore.currentPost);
const loading = ref(true);
const isLiked = ref(false);
const likeCount = ref(0);
const commentCount = ref(0);
const renderedContent = ref('');

const currentUrl = computed(() => {
  if (import.meta.client) {
    return window.location.href;
  }
  return '';
});

const { formatDate } = useFormatDate();

usePageMeta(
  post.value?.title || '文章详情',
  post.value?.excerpt || undefined,
  post.value?.cover_image || undefined,
);

async function toggleLike() {
  if (!authStore.isAuthenticated) {
    uiStore.showToast('warning', '请先登录');
    return navigateTo('/auth/login');
  }

  try {
    const config = useRuntimeConfig();
    const method = isLiked.value ? 'DELETE' : 'POST';
    const res = await fetch(
      `${config.public.apiBase}/posts/${post.value?.id}/like`,
      {
        method,
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      },
    );
    const json = await res.json();
    if (json.success) {
      isLiked.value = json.data.liked;
      likeCount.value += json.data.liked ? 1 : -1;
    }
  } catch (e) {
    console.error('Failed to toggle like', e);
  }
}

async function fetchLikeStatus() {
  if (!authStore.isAuthenticated || !post.value) return;
  try {
    const config = useRuntimeConfig();
    const res = await fetch(
      `${config.public.apiBase}/posts/${post.value.id}/like/status`,
      {
        headers: { Authorization: `Bearer ${authStore.token}` },
      },
    );
    const json = await res.json();
    if (json.success) {
      isLiked.value = json.data.liked;
      likeCount.value = json.data.count;
    }
  } catch (e) {
    console.error('Failed to fetch like status', e);
  }
}

async function renderMarkdown(content: string) {
  try {
    const { codeToHtml } = await import('shiki');
    const html = await codeToHtml(content, {
      lang: 'markdown',
      theme: 'github-light',
    });
    renderedContent.value = html;
  } catch {
    renderedContent.value = `<div class="prose-custom">${content}</div>`;
  }
}

onMounted(async () => {
  const slug = route.params.slug as string;
  try {
    await postsStore.fetchPostBySlug(slug);
    if (post.value) {
      usePageMeta(
        post.value.title,
        post.value.excerpt || undefined,
        post.value.cover_image || undefined,
      );
      commentCount.value = post.value.comment_count;
      likeCount.value = post.value.like_count || 0;
      await renderMarkdown(post.value.content);
      await postsStore.fetchRelatedPosts(post.value.id);
      if (authStore.isAuthenticated) {
        await fetchLikeStatus();
      }
    }
  } catch (e) {
    console.error('Failed to fetch post', e);
  } finally {
    loading.value = false;
  }
});
</script>
