<template>
  <div>
    <h2 class="mb-6 text-2xl font-bold text-slate-800 dark:text-slate-100">
      仪表盘
    </h2>

    <LoadingSpinner v-if="loading" />

    <template v-else>
      <div class="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border bg-white p-4 dark:bg-slate-800">
          <div class="text-xs font-medium uppercase tracking-wider text-slate-400">文章总数</div>
          <div class="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats.totalPosts }}</div>
          <div class="mt-1 text-xs text-slate-400">已发布 {{ stats.publishedPosts }} / 草稿 {{ stats.draftPosts }}</div>
        </div>
        <div class="rounded-lg border bg-white p-4 dark:bg-slate-800">
          <div class="text-xs font-medium uppercase tracking-wider text-slate-400">评论总数</div>
          <div class="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats.totalComments }}</div>
          <div class="mt-1 text-xs text-yellow-500">待审核 {{ stats.pendingComments }}</div>
        </div>
        <div class="rounded-lg border bg-white p-4 dark:bg-slate-800">
          <div class="text-xs font-medium uppercase tracking-wider text-slate-400">用户总数</div>
          <div class="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats.totalUsers }}</div>
        </div>
        <div class="rounded-lg border bg-white p-4 dark:bg-slate-800">
          <div class="text-xs font-medium uppercase tracking-wider text-slate-400">总访问量</div>
          <div class="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats.totalViews }}</div>
        </div>
      </div>

      <div class="mb-8 grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg border bg-white p-4 dark:bg-slate-800">
          <div class="text-xs font-medium uppercase tracking-wider text-slate-400">分类</div>
          <div class="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats.totalCategories }}</div>
        </div>
        <div class="rounded-lg border bg-white p-4 dark:bg-slate-800">
          <div class="text-xs font-medium uppercase tracking-wider text-slate-400">标签</div>
          <div class="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats.totalTags }}</div>
        </div>
      </div>

      <!-- Popular Posts -->
      <div class="mb-8">
        <h3 class="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">热门文章</h3>
        <div class="rounded-lg border bg-white dark:bg-slate-800">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b dark:border-slate-700">
                <th class="px-4 py-3 font-medium text-slate-500">标题</th>
                <th class="px-4 py-3 font-medium text-slate-500">阅读</th>
                <th class="px-4 py-3 font-medium text-slate-500">点赞</th>
                <th class="px-4 py-3 font-medium text-slate-500">评论</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="post in popularPosts"
                :key="post.id"
                class="border-b last:border-0 dark:border-slate-700"
              >
                <td class="px-4 py-3">
                  <NuxtLink
                    :to="`/posts/${post.slug}`"
                    class="font-medium text-slate-700 hover:text-primary-600 dark:text-slate-300"
                  >
                    {{ post.title }}
                  </NuxtLink>
                </td>
                <td class="px-4 py-3 text-slate-500">{{ post.view_count }}</td>
                <td class="px-4 py-3 text-slate-500">{{ post.like_count }}</td>
                <td class="px-4 py-3 text-slate-500">{{ post.comment_count }}</td>
              </tr>
              <tr v-if="popularPosts.length === 0">
                <td colspan="4" class="px-4 py-8 text-center text-slate-400">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Views Trend -->
      <div>
        <h3 class="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">访问趋势（近30天）</h3>
        <div class="rounded-lg border bg-white p-4 dark:bg-slate-800">
          <div v-if="viewsTrend.length === 0" class="py-8 text-center text-sm text-slate-400">
            暂无访问数据
          </div>
          <div v-else class="flex items-end gap-1" style="height: 200px">
            <div
              v-for="(item, index) in viewsTrend"
              :key="index"
              class="flex flex-1 flex-col items-center"
            >
              <div
                class="w-full rounded-t bg-primary-500 transition-all hover:bg-primary-600"
                :style="{ height: getBarHeight(item.count) + 'px' }"
                :title="`${item.date}: ${item.count} 次访问`"
              />
              <span class="mt-1 text-[10px] text-slate-400">{{ formatDateLabel(item.date) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DashboardStats, ViewsTrend, PopularPost } from '@blog/shared/types';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
});

const loading = ref(true);
const stats = ref<DashboardStats>({
  totalPosts: 0,
  totalComments: 0,
  totalUsers: 0,
  totalViews: 0,
  publishedPosts: 0,
  draftPosts: 0,
  pendingComments: 0,
  totalCategories: 0,
  totalTags: 0,
});
const viewsTrend = ref<ViewsTrend[]>([]);
const popularPosts = ref<PopularPost[]>([]);

function getBarHeight(count: number): number {
  const max = Math.max(...viewsTrend.value.map((v) => v.count), 1);
  return (count / max) * 170;
}

function formatDateLabel(date: string): string {
  return date.slice(5); // MM-DD
}

onMounted(async () => {
  try {
    const api = useApi();
    const config = useRuntimeConfig();
    const token = useAuthStore().token;
    const headers = { Authorization: `Bearer ${token}` };

    const [statsRes, viewsRes, popularRes] = await Promise.all([
      fetch(`${config.public.apiBase}/dashboard/stats`, { headers }),
      fetch(`${config.public.apiBase}/dashboard/views`, { headers }),
      fetch(`${config.public.apiBase}/dashboard/popular-posts`, { headers }),
    ]);

    const statsJson = await statsRes.json();
    const viewsJson = await viewsRes.json();
    const popularJson = await popularRes.json();

    if (statsJson.success) stats.value = statsJson.data;
    if (viewsJson.success) viewsTrend.value = viewsJson.data;
    if (popularJson.success) popularPosts.value = popularJson.data;
  } catch (e) {
    console.error('Failed to load dashboard', e);
  } finally {
    loading.value = false;
  }
});
</script>
