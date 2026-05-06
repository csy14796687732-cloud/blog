<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">文章管理</h2>
      <NuxtLink
        to="/admin/posts/create"
        class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
      >
        写文章
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="mb-6 flex flex-wrap gap-3">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索文章..."
        class="rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:bg-slate-700"
        @keydown.enter="loadPosts"
      />
      <select
        v-model="statusFilter"
        class="rounded-lg border px-3 py-2 text-sm dark:bg-slate-700"
        @change="loadPosts"
      >
        <option value="">全部状态</option>
        <option value="published">已发布</option>
        <option value="draft">草稿</option>
      </select>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else class="rounded-lg border bg-white dark:bg-slate-800">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b dark:border-slate-700">
            <th class="px-4 py-3 font-medium text-slate-500">标题</th>
            <th class="px-4 py-3 font-medium text-slate-500">状态</th>
            <th class="px-4 py-3 font-medium text-slate-500">分类</th>
            <th class="px-4 py-3 font-medium text-slate-500">阅读</th>
            <th class="px-4 py-3 font-medium text-slate-500">日期</th>
            <th class="px-4 py-3 font-medium text-slate-500">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="post in posts"
            :key="post.id"
            class="border-b last:border-0 dark:border-slate-700"
          >
            <td class="max-w-xs truncate px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
              {{ post.title }}
            </td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="post.status === 'published'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'"
              >
                {{ post.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td class="px-4 py-3 text-slate-500">{{ post.category?.name || '-' }}</td>
            <td class="px-4 py-3 text-slate-500">{{ post.view_count }}</td>
            <td class="px-4 py-3 text-slate-500">{{ formatDateShort(post.updated_at) }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <NuxtLink
                  :to="`/admin/posts/${post.id}/edit`"
                  class="text-primary-600 hover:text-primary-700"
                >
                  编辑
                </NuxtLink>
                <button
                  class="text-red-500 hover:text-red-600"
                  @click="confirmDelete(post.id)"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="posts.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-slate-400">暂无文章</td>
          </tr>
        </tbody>
      </table>

      <div class="border-t px-4 py-3 dark:border-slate-700">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="onPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PostWithRelations } from '@blog/shared/types';
import { useFormatDate } from '~/composables/useFormatDate';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
});

const posts = ref<PostWithRelations[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const totalPages = ref(1);
const searchQuery = ref('');
const statusFilter = ref('');
const uiStore = useUiStore();
const authStore = useAuthStore();
const api = useApi();
const { formatDateShort } = useFormatDate();

async function loadPosts() {
  loading.value = true;
  try {
    const config = useRuntimeConfig();
    const query = new URLSearchParams({
      page: String(currentPage.value),
      pageSize: '20',
    });
    if (statusFilter.value) query.set('status', statusFilter.value);
    if (searchQuery.value) query.set('search', searchQuery.value);

    const res = await fetch(`${config.public.apiBase}/posts?${query}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    const json = await res.json();
    if (json.success && json.data) {
      posts.value = json.data.items;
      totalPages.value = json.data.totalPages;
    }
  } catch (e) {
    console.error('Failed to load posts', e);
  } finally {
    loading.value = false;
  }
}

async function confirmDelete(postId: string) {
  const confirmed = await uiStore.showConfirm(
    '确认删除',
    '确定要删除这篇文章吗？此操作不可撤销。',
  );

  if (confirmed) {
    try {
      const config = useRuntimeConfig();
      await fetch(`${config.public.apiBase}/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authStore.token}` },
      });
      uiStore.showToast('success', '文章已删除');
      await loadPosts();
    } catch {
      uiStore.showToast('error', '删除失败');
    }
  }
}

function onPageChange(page: number) {
  currentPage.value = page;
  loadPosts();
}

onMounted(loadPosts);
</script>
