<template>
  <div>
    <!-- Comment Form -->
    <div v-if="authStore.isAuthenticated" class="mb-8">
      <CommentForm :post-id="postId" @comment-created="loadComments" />
    </div>
    <div v-else class="mb-8 rounded-lg border border-dashed p-6 text-center">
      <p class="text-sm text-slate-500 dark:text-slate-400">
        请
        <NuxtLink to="/auth/login" class="font-medium text-primary-600 hover:text-primary-700">登录</NuxtLink>
        后发表评论
      </p>
    </div>

    <!-- Comments List -->
    <LoadingSpinner v-if="loading" size="sm" />

    <div v-else class="space-y-6">
      <div v-for="comment in comments" :key="comment.id" class="rounded-lg border bg-slate-50 p-4 dark:bg-slate-800/50">
        <div class="mb-2 flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            {{ comment.user?.display_name?.charAt(0) || '?' }}
          </div>
          <div>
            <div class="text-sm font-medium text-slate-700 dark:text-slate-300">
              {{ comment.user?.display_name || '匿名' }}
            </div>
            <div class="text-xs text-slate-400">{{ timeAgo(comment.created_at) }}</div>
          </div>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-400">{{ comment.content }}</p>

        <!-- Replies -->
        <div v-if="comment.replies && comment.replies.length > 0" class="ml-10 mt-4 space-y-4">
          <div v-for="reply in comment.replies" :key="reply.id" class="rounded-lg border-l-2 border-primary-200 bg-white pl-4 dark:bg-slate-800">
            <div class="mb-2 flex items-center gap-2">
              <div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700">
                {{ reply.user?.display_name?.charAt(0) || '?' }}
              </div>
              <div class="text-xs font-medium text-slate-600 dark:text-slate-300">
                {{ reply.user?.display_name || '匿名' }}
              </div>
              <div class="text-xs text-slate-400">{{ timeAgo(reply.created_at) }}</div>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400">{{ reply.content }}</p>
          </div>
        </div>
      </div>

      <div v-if="comments.length === 0 && !loading" class="py-8 text-center text-sm text-slate-400">
        暂无评论，来发表第一条评论吧
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

const props = defineProps<{
  postId: string;
}>();

const authStore = useAuthStore();
const { timeAgo } = useFormatDate();

const comments = ref<Comment[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const totalPages = ref(1);

async function loadComments() {
  loading.value = true;
  try {
    const config = useRuntimeConfig();
    const res = await fetch(
      `${config.public.apiBase}/posts/${props.postId}/comments?page=${currentPage.value}&pageSize=20`,
    );
    const json = await res.json();
    if (json.success && json.data) {
      comments.value = json.data.items;
      totalPages.value = json.data.totalPages;
    }
  } catch (e) {
    console.error('Failed to load comments', e);
  } finally {
    loading.value = false;
  }
}

function onPageChange(page: number) {
  currentPage.value = page;
  loadComments();
}

onMounted(loadComments);
</script>
