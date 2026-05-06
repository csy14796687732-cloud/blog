<template>
  <div class="flex items-center gap-2">
    <span class="text-sm text-slate-500 dark:text-slate-400">分享：</span>
    <button
      aria-label="分享到微博"
      class="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
      @click="shareWeibo"
    >
      <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.194 14.197c0 3.248-4.145 7.065-10.59 7.065-5.156 0-9.604-2.36-9.604-5.997 0-1.873 1.087-4.035 2.96-5.306.994-.673 1.876-.982 1.876-1.66 0-.518-.305-1.024-.864-1.532-1.3-1.184-2.154-2.765-2.154-4.256 0-3.484 3.607-6.016 7.327-6.016 3.902 0 6.887 2.26 6.887 4.95 0 1.304-.625 2.455-1.678 3.248-.699.529-1.074.893-1.074 1.432 0 .326.184.717.515 1.172.631.868 1.004 1.917 1.004 2.916 0 .964-.417 1.855-1.22 2.524-1.058.879-2.01 1.101-3.143 1.101-2.384 0-4.34-1.698-4.34-3.878 0-1.29.638-2.48 1.74-3.291.91-.672 1.837-1.023 1.837-1.75 0-.444-.269-.84-.778-1.125-.783-.44-1.237-.798-1.237-1.718 0-1.007.891-1.888 2.008-1.888 1.235 0 2.2.93 2.2 2.075 0 .362-.085.704-.24 1.008.653-.255 1.394-.39 2.184-.39 3.282 0 5.96 2.607 5.96 5.81z" />
      </svg>
    </button>
    <button
      aria-label="分享到 Twitter"
      class="rounded-full p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-500"
      @click="shareTwitter"
    >
      <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    </button>
    <button
      aria-label="复制链接"
      class="rounded-full p-2 text-slate-400 transition hover:bg-green-50 hover:text-green-500"
      @click="copyLink"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  url: string;
}>();

const uiStore = useUiStore();

function shareWeibo() {
  window.open(
    `https://service.weibo.com/share/share.php?title=${encodeURIComponent(props.title)}&url=${encodeURIComponent(props.url)}`,
    '_blank',
    'width=600,height=500',
  );
}

function shareTwitter() {
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.title)}&url=${encodeURIComponent(props.url)}`,
    '_blank',
    'width=600,height=400',
  );
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url);
    uiStore.showToast('success', '链接已复制');
  } catch {
    uiStore.showToast('error', '复制失败');
  }
}
</script>
