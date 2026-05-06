<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">评论管理</h2>
      <div class="flex gap-2">
        <Button
          :variant="statusFilter === '' ? 'primary' : 'secondary'"
          size="sm"
          @click="statusFilter = ''; loadComments()"
        >
          全部
        </Button>
        <Button
          :variant="statusFilter === 'pending' ? 'primary' : 'secondary'"
          size="sm"
          @click="statusFilter = 'pending'; loadComments()"
        >
          待审核
        </Button>
        <Button
          :variant="statusFilter === 'approved' ? 'primary' : 'secondary'"
          size="sm"
          @click="statusFilter = 'approved'; loadComments()"
        >
          已通过
        </Button>
        <Button
          :variant="statusFilter === 'rejected' ? 'primary' : 'secondary'"
          size="sm"
          @click="statusFilter = 'rejected'; loadComments()"
        >
          已拒绝
        </Button>
      </div>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else class="space-y-4">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="rounded-lg border bg-white p-4 dark:bg-slate-800"
      >
        <div class="mb-2 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-medium text-slate-700 dark:text-slate-300">
              {{ comment.user?.display_name || '匿名' }}
            </span>
            <span
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="statusClass(comment.status)"
            >
              {{ statusLabel(comment.status) }}
            </span>
          </div>
          <span class="text-xs text-slate-400">{{ formatDateShort(comment.created_at) }}</span>
        </div>
        <p class="mb-3 text-sm text-slate-600 dark:text-slate-400">{{ comment.content }}</p>
        <div class="flex items-center gap-3">
          <button
            v-if="comment.status === 'pending'"
            class="text-xs font-medium text-green-600 hover:text-green-700"
            @click="updateStatus(comment.id, 'approved')"
          >
            通过
          </button>
          <button
            v-if="comment.status === 'pending'"
            class="text-xs font-medium text-red-600 hover:text-red-700"
            @click="updateStatus(comment.id, 'rejected')"
          >
            拒绝
          </button>
          <button
            class="text-xs font-medium text-red-500 hover:text-red-600"
            @click="deleteComment(comment.id)"
          >
            删除
          </button>
        </div>
      </div>

      <div v-if="comments.length === 0" class="py-12 text-center text-slate-400">
        暂无评论
      </div>

      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Comment } from '@blog/shared/types';
import { useFormatDate } from '~/composables/useFormatDate';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const api = useApi();
const uiStore = useUiStore();
const { formatDateShort } = useFormatDate();

const comments = ref<Comment[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const totalPages = ref(1);
const statusFilter = ref('');

function statusClass(status: string) {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'approved': return '已通过';
    case 'rejected': return '已拒绝';
    default: return '待审核';
  }
}

async function loadComments() {
  loading.value = true;
  try {
    const query = new URLSearchParams({
      page: String(currentPage.value),
      pageSize: '20',
    });
    if (statusFilter.value) query.set('status', statusFilter.value);

    const res = await api.get<any>(`/admin/comments?${query}`);
    if (res.success && res.data) {
      comments.value = res.data.items;
      totalPages.value = res.data.totalPages;
    }
  } finally {
    loading.value = false;
  }
}

async function updateStatus(commentId: string, status: string) {
  try {
    const res = await api.put(`/admin/comments/${commentId}/status`, { status });
    if (res.success) {
      uiStore.showToast('success', '状态已更新');
      await loadComments();
    }
  } catch {
    uiStore.showToast('error', '操作失败');
  }
}

async function deleteComment(commentId: string) {
  const confirmed = await uiStore.showConfirm('确认删除', '确定要删除此评论吗？');
  if (confirmed) {
    try {
      const res = await api.delete(`/comments/${commentId}`);
      if (res.success) {
        uiStore.showToast('success', '评论已删除');
        await loadComments();
      }
    } catch {
      uiStore.showToast('error', '删除失败');
    }
  }
}

function onPageChange(page: number) {
  currentPage.value = page;
  loadComments();
}

onMounted(loadComments);
</script>
