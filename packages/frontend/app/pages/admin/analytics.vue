<template>
  <div>
    <h2 class="mb-6 text-2xl font-bold text-slate-800 dark:text-slate-100">数据分析</h2>

    <LoadingSpinner v-if="loading" />

    <template v-else>
      <!-- Overview Cards -->
      <div class="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border bg-white p-4 dark:bg-slate-800">
          <div class="text-xs font-medium uppercase tracking-wider text-slate-400">文章总数</div>
          <div class="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats.totalPosts }}</div>
        </div>
        <div class="rounded-lg border bg-white p-4 dark:bg-slate-800">
          <div class="text-xs font-medium uppercase tracking-wider text-slate-400">发布率</div>
          <div class="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
            {{ stats.totalPosts > 0 ? Math.round(stats.publishedPosts / stats.totalPosts * 100) : 0 }}%
          </div>
        </div>
        <div class="rounded-lg border bg-white p-4 dark:bg-slate-800">
          <div class="text-xs font-medium uppercase tracking-wider text-slate-400">总评论数</div>
          <div class="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats.totalComments }}</div>
        </div>
        <div class="rounded-lg border bg-white p-4 dark:bg-slate-800">
          <div class="text-xs font-medium uppercase tracking-wider text-slate-400">总访问量</div>
          <div class="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats.totalViews }}</div>
        </div>
      </div>

      <!-- Views Trend -->
      <div class="mb-8">
        <h3 class="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">访问趋势</h3>
        <div class="rounded-lg border bg-white p-4 dark:bg-slate-800">
          <div v-if="viewsTrend.length === 0" class="py-12 text-center text-sm text-slate-400">
            暂无访问数据
          </div>
          <div v-else class="flex items-end gap-1" style="height: 250px">
            <div
              v-for="(item, index) in viewsTrend"
              :key="index"
              class="flex flex-1 flex-col items-center"
            >
              <div
                class="w-full rounded-t bg-gradient-to-t from-primary-500 to-primary-300 transition-all hover:from-primary-600"
                :style="{ height: getBarHeight(item.count) + 'px' }"
                :title="`${item.date}: ${item.count}`"
              />
              <span class="mt-1 text-[10px] text-slate-400">{{ formatDateLabel(item.date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Popular Posts -->
      <div>
        <h3 class="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">热门文章排行</h3>
        <div class="rounded-lg border bg-white dark:bg-slate-800">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b dark:border-slate-700">
                <th class="px-4 py-3 font-medium text-slate-500">#</th>
                <th class="px-4 py-3 font-medium text-slate-500">标题</th>
                <th class="px-4 py-3 font-medium text-slate-500">阅读量</th>
                <th class="px-4 py-3 font-medium text-slate-500">点赞</th>
                <th class="px-4 py-3 font-medium text-slate-500">评论</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(post, index) in popularPosts"
                :key="post.id"
                class="border-b last:border-0 dark:border-slate-700"
              >
                <td class="px-4 py-3 text-slate-400">{{ index + 1 }}</td>
                <td class="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                  <NuxtLink :to="`/posts/${post.slug}`" class="hover:text-primary-600">
                    {{ post.title }}
                  </NuxtLink>
                </td>
                <td class="px-4 py-3 text-slate-500">{{ post.view_count }}</td>
                <td class="px-4 py-3 text-slate-500">{{ post.like_count }}</td>
                <td class="px-4 py-3 text-slate-500">{{ post.comment_count }}</td>
              </tr>
              <tr v-if="popularPosts.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-slate-400">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DashboardStats, ViewsTrend, PopularPost } from '@blog/shared/types';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const loading = ref(true);
const stats = ref<DashboardStats>({
  totalPosts: 0, totalComments: 0, totalUsers: 0, totalViews: 0,
  publishedPosts: 0, draftPosts: 0, pendingComments: 0,
  totalCategories: 0, totalTags: 0,
});
const viewsTrend = ref<ViewsTrend[]>([]);
const popularPosts = ref<PopularPost[]>([]);

function getBarHeight(count: number): number {
  const max = Math.max(...viewsTrend.value.map((v) => v.count), 1);
  return (count / max) * 220;
}
function formatDateLabel(date: string): string {
  return date.slice(5);
}

onMounted(async () => {
  try {
    const config = useRuntimeConfig();
    const token = useAuthStore().token;
    const headers = { Authorization: `Bearer ${token}` };

    const [statsRes, viewsRes, popularRes] = await Promise.all([
      fetch(`${config.public.apiBase}/dashboard/stats`, { headers }),
      fetch(`${config.public.apiBase}/dashboard/views?days=30`, { headers }),
      fetch(`${config.public.apiBase}/dashboard/popular-posts?limit=20`, { headers }),
    ]);

    const sj = await statsRes.json();
    const vj = await viewsRes.json();
    const pj = await popularRes.json();

    if (sj.success) stats.value = sj.data;
    if (vj.success) viewsTrend.value = vj.data;
    if (pj.success) popularPosts.value = pj.data;
  } catch (e) {
    console.error('Failed to load analytics', e);
  } finally {
    loading.value = false;
  }
});
</script>
