<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-900">
    <AdminSidebar />
    <div class="flex flex-1 flex-col lg:pl-64">
      <AdminHeader />
      <main class="flex-1 p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
});
</script>
