<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="text-2xl font-bold text-primary-600 hover:text-primary-700">
          个人博客
        </NuxtLink>
      </div>
      <div class="rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-800">
        <slot />
      </div>
    </div>
  </div>
</template>
