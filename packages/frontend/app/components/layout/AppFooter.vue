<template>
  <footer class="border-t bg-slate-50 dark:bg-slate-900/50">
    <div class="mx-auto max-w-6xl px-4 py-8">
      <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div class="text-sm text-slate-500 dark:text-slate-400">
          &copy; {{ new Date().getFullYear() }} 个人博客. All rights reserved.
        </div>
        <div class="flex items-center gap-4">
          <a
            href="/api/rss"
            class="text-sm text-slate-500 transition hover:text-primary-600 dark:text-slate-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            RSS
          </a>
          <a
            href="#"
            class="text-sm text-slate-500 transition hover:text-primary-600 dark:text-slate-400"
          >
            GitHub
          </a>
          <a
            href="#"
            class="text-sm text-slate-500 transition hover:text-primary-600 dark:text-slate-400"
          >
            Twitter
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
