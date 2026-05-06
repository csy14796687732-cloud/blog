<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 w-64 -translate-x-full border-r bg-white transition-transform dark:bg-slate-800 lg:translate-x-0"
    :class="{ 'translate-x-0': open }"
  >
    <div class="flex h-16 items-center border-b px-6">
      <NuxtLink to="/admin" class="text-lg font-bold text-primary-600">
        管理后台
      </NuxtLink>
    </div>

    <nav class="flex flex-col gap-1 p-4">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-primary-600 dark:text-slate-300 dark:hover:bg-slate-700"
        :class="{ 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400': isActive(item.to) }"
      >
        <component :is="item.icon" class="h-5 w-5" />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <div class="absolute bottom-0 left-0 right-0 border-t p-4">
      <NuxtLink
        to="/"
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        返回前台
      </NuxtLink>
    </div>
  </aside>

  <!-- Overlay for mobile -->
  <div
    v-if="open"
    class="fixed inset-0 z-30 bg-black/50 lg:hidden"
    @click="open = false"
  />
</template>

<script setup lang="ts">
const route = useRoute();
const open = ref(false);

const navItems = [
  {
    label: '仪表盘',
    to: '/admin',
    icon: defineComponent({
      template:
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
    }),
  },
  {
    label: '文章管理',
    to: '/admin/posts',
    icon: defineComponent({
      template:
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
    }),
  },
  {
    label: '分类管理',
    to: '/admin/categories',
    icon: defineComponent({
      template:
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>',
    }),
  },
  {
    label: '标签管理',
    to: '/admin/tags',
    icon: defineComponent({
      template:
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>',
    }),
  },
  {
    label: '评论管理',
    to: '/admin/comments',
    icon: defineComponent({
      template:
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>',
    }),
  },
  {
    label: '个人设置',
    to: '/admin/profile',
    icon: defineComponent({
      template:
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
    }),
  },
  {
    label: '数据分析',
    to: '/admin/analytics',
    icon: defineComponent({
      template:
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
    }),
  },
];

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin';
  return route.path.startsWith(path);
}

function toggle() {
  open.value = !open.value;
}

defineExpose({ toggle });
</script>
