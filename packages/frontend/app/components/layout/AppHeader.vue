<template>
  <header class="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
    <nav class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
      <!-- Logo -->
      <NuxtLink to="/" class="text-xl font-bold text-primary-600 hover:text-primary-700">
        个人博客
      </NuxtLink>

      <!-- Desktop Navigation -->
      <div class="hidden items-center gap-6 md:flex">
        <NuxtLink
          to="/"
          class="text-sm font-medium text-slate-600 transition hover:text-primary-600 dark:text-slate-300"
        >
          首页
        </NuxtLink>
        <NuxtLink
          to="/posts"
          class="text-sm font-medium text-slate-600 transition hover:text-primary-600 dark:text-slate-300"
        >
          文章
        </NuxtLink>
        <NuxtLink
          to="/about"
          class="text-sm font-medium text-slate-600 transition hover:text-primary-600 dark:text-slate-300"
        >
          关于
        </NuxtLink>

        <!-- Search -->
        <button
          aria-label="搜索"
          class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800"
          @click="showSearch = true"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        <!-- Theme Toggle -->
        <button
          aria-label="切换主题"
          class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800"
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

        <!-- Auth -->
        <template v-if="authStore.isAuthenticated">
          <NuxtLink
            v-if="authStore.isAdmin"
            to="/admin"
            class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
          >
            后台管理
          </NuxtLink>
          <button
            class="text-sm font-medium text-slate-600 transition hover:text-primary-600 dark:text-slate-300"
            @click="authStore.logout()"
          >
            退出
          </button>
        </template>
        <template v-else>
          <NuxtLink
            to="/auth/login"
            class="text-sm font-medium text-slate-600 transition hover:text-primary-600 dark:text-slate-300"
          >
            登录
          </NuxtLink>
          <NuxtLink
            to="/auth/register"
            class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
          >
            注册
          </NuxtLink>
        </template>
      </div>

      <!-- Mobile Menu Button -->
      <button
        aria-label="菜单"
        class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 md:hidden"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            v-if="!mobileMenuOpen"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </nav>

    <!-- Mobile Menu -->
    <div
      v-if="mobileMenuOpen"
      class="border-t bg-white px-4 pb-4 pt-2 dark:bg-slate-900 md:hidden"
    >
      <div class="flex flex-col gap-3">
        <NuxtLink
          to="/"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300"
          @click="mobileMenuOpen = false"
        >
          首页
        </NuxtLink>
        <NuxtLink
          to="/posts"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300"
          @click="mobileMenuOpen = false"
        >
          文章
        </NuxtLink>
        <NuxtLink
          to="/about"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300"
          @click="mobileMenuOpen = false"
        >
          关于
        </NuxtLink>
        <hr class="dark:border-slate-700" />
        <template v-if="authStore.isAuthenticated">
          <NuxtLink
            v-if="authStore.isAdmin"
            to="/admin"
            class="rounded-lg bg-primary-600 px-3 py-2 text-center text-sm font-medium text-white"
            @click="mobileMenuOpen = false"
          >
            后台管理
          </NuxtLink>
          <button
            class="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300"
            @click="authStore.logout()"
          >
            退出
          </button>
        </template>
        <template v-else>
          <NuxtLink
            to="/auth/login"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300"
            @click="mobileMenuOpen = false"
          >
            登录
          </NuxtLink>
          <NuxtLink
            to="/auth/register"
            class="rounded-lg bg-primary-600 px-3 py-2 text-center text-sm font-medium text-white"
            @click="mobileMenuOpen = false"
          >
            注册
          </NuxtLink>
        </template>
      </div>
    </div>

    <!-- Search Overlay -->
    <div
      v-if="showSearch"
      class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20"
      @click.self="showSearch = false"
    >
      <div class="mx-4 w-full max-w-lg rounded-lg bg-white p-4 shadow-xl dark:bg-slate-800">
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="搜索文章..."
          class="w-full rounded-lg border px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-700"
          @keydown.enter="doSearch"
        />
        <div class="mt-2 flex justify-end gap-2">
          <button
            class="rounded-lg px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300"
            @click="showSearch = false"
          >
            取消
          </button>
          <button
            class="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white transition hover:bg-primary-700"
            @click="doSearch"
          >
            搜索
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const themeStore = useThemeStore();
const authStore = useAuthStore();

const mobileMenuOpen = ref(false);
const showSearch = ref(false);
const searchQuery = ref('');

function doSearch() {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
    showSearch.value = false;
    searchQuery.value = '';
  }
}
</script>
