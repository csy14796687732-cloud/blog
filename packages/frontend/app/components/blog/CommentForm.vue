<template>
  <form @submit.prevent="submitComment">
    <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
      发表评论
    </label>
    <textarea
      v-model="content"
      rows="3"
      required
      placeholder="写下你的评论..."
      maxlength="2000"
      class="mb-3 w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-700"
    />
    <div class="flex items-center justify-between">
      <span class="text-xs text-slate-400">{{ content.length }}/2000</span>
      <Button type="submit" size="sm" :loading="submitting">
        发表评论
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{
  postId: string;
}>();

const emit = defineEmits<{
  'comment-created': [];
}>();

const authStore = useAuthStore();
const uiStore = useUiStore();

const content = ref('');
const submitting = ref(false);

async function submitComment() {
  if (!content.value.trim()) return;

  submitting.value = true;
  try {
    const config = useRuntimeConfig();
    const res = await fetch(`${config.public.apiBase}/posts/${props.postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ content: content.value }),
    });
    const json = await res.json();
    if (json.success) {
      content.value = '';
      uiStore.showToast('success', '评论已提交，等待审核');
      emit('comment-created');
    } else {
      uiStore.showToast('error', json.message || '评论失败');
    }
  } catch {
    uiStore.showToast('error', '评论提交失败');
  } finally {
    submitting.value = false;
  }
}
</script>
