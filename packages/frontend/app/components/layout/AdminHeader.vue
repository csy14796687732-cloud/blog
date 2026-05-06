<template>
  <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 dark:bg-slate-800 lg:px-6">
    <div class="flex items-center gap-3">
      <button
        aria-label="菜单"
        class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        @click="$emit('toggle-sidebar')"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
        {{ pageTitle }}
      </h1>
    </div>

    <div class="flex items-center gap-3">
      <button
        aria-label="切换主题"
        class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-700"
        @click="themeStore.toggle()"
      >
        <svg
          v-if="!themeStore.isDark"
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
        <svg
          v-else
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>

      <div class="flex items-center gap-2">
        <div class="h-8 w-8 rounded-full bg-primary-100 text-center leading-8 text-sm font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300">
          {{ authStore.user?.display_name?.charAt(0) || 'U' }}
        </div>
        <span class="hidden text-sm font-medium text-slate-700 dark:text-slate-300 sm:block">
          {{ authStore.user?.display_name }}
        </span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const themeStore = useThemeStore();
const authStore = useAuthStore();
const route = useRoute();

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/admin': '仪表盘',
    '/admin/posts': '文章管理',
    '/admin/posts/create': '写文章',
    '/admin/categories': '分类管理',
    '/admin/tags': '标签管理',
    '/admin/comments': '评论管理',
    '/admin/profile': '个人设置',
    '/admin/analytics': '数据分析',
  };

  const match = Object.keys(titles).find((key) => route.path.startsWith(key));
  return match ? titles[match] : '管理后台';
});

defineEmits<{
  'toggle-sidebar': [];
}>();
</script>
