<template>
  <article
    class="group overflow-hidden rounded-lg border bg-white transition hover:shadow-md dark:bg-slate-800"
  >
    <NuxtLink :to="`/posts/${post.slug}`" class="block">
      <!-- Cover Image -->
      <div v-if="post.cover_image" class="aspect-video overflow-hidden bg-slate-100 dark:bg-slate-700">
        <img
          :src="post.cover_image"
          :alt="post.title"
          class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div v-else class="flex aspect-video items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/20">
        <svg class="h-12 w-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      </div>

      <!-- Content -->
      <div class="p-5">
        <!-- Categories -->
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <span
            v-if="post.category"
            class="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
          >
            {{ post.category.name }}
          </span>
        </div>

        <!-- Title -->
        <h3 class="mb-2 text-lg font-semibold text-slate-800 transition group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400">
          {{ post.title }}
        </h3>

        <!-- Excerpt -->
        <p v-if="post.excerpt" class="mb-4 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {{ post.excerpt }}
        </p>

        <!-- Meta -->
        <div class="flex items-center justify-between text-xs text-slate-400">
          <div class="flex items-center gap-3">
            <span>{{ formatDate(post.published_at || post.created_at) }}</span>
            <span class="flex items-center gap-1">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {{ post.view_count }}
            </span>
            <span class="flex items-center gap-1">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {{ post.like_count }}
            </span>
          </div>

          <!-- Tags -->
          <div v-if="post.tags?.length" class="hidden items-center gap-1 sm:flex">
            <span
              v-for="tag in post.tags.slice(0, 3)"
              :key="tag.id"
              class="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
import type { PostWithRelations } from '@blog/shared/types';
import { useFormatDate } from '~/composables/useFormatDate';

defineProps<{
  post: PostWithRelations;
}>();

const { formatDate } = useFormatDate();
</script>
