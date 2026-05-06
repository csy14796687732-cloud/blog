<template>
  <div>
    <h2 class="mb-6 text-2xl font-bold text-slate-800 dark:text-slate-100">写文章</h2>

    <form class="space-y-6" @submit.prevent="savePost">
      <div class="grid gap-6 lg:grid-cols-3">
        <div class="space-y-4 lg:col-span-2">
          <div>
            <input
              v-model="title"
              type="text"
              placeholder="文章标题"
              required
              class="w-full rounded-lg border px-4 py-3 text-lg font-medium focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-700"
            />
          </div>

          <div>
            <textarea
              v-model="excerpt"
              placeholder="文章摘要（可选）"
              rows="2"
              class="w-full rounded-lg border px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-700"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              文章内容（支持 Markdown）
            </label>
            <textarea
              v-model="content"
              rows="20"
              required
              placeholder="在此输入 Markdown 内容..."
              class="w-full rounded-lg border px-4 py-3 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-700"
            />
          </div>
        </div>

        <div class="space-y-4">
          <!-- Publish Settings -->
          <div class="rounded-lg border bg-white p-4 dark:bg-slate-800">
            <h3 class="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">发布设置</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <input
                  id="featured"
                  v-model="featured"
                  type="checkbox"
                  class="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <label for="featured" class="text-sm text-slate-600 dark:text-slate-400">精选文章</label>
              </div>
            </div>
          </div>

          <!-- Category -->
          <div class="rounded-lg border bg-white p-4 dark:bg-slate-800">
            <h3 class="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">分类</h3>
            <select
              v-model="categoryId"
              class="w-full rounded-lg border px-3 py-2 text-sm dark:bg-slate-700"
            >
              <option value="">无分类</option>
              <option
                v-for="cat in categories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Tags -->
          <div class="rounded-lg border bg-white p-4 dark:bg-slate-800">
            <h3 class="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">标签</h3>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="tag in allTags"
                :key="tag.id"
                class="flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition"
                :class="selectedTags.includes(tag.id)
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'hover:border-slate-300'"
              >
                <input
                  type="checkbox"
                  :value="tag.id"
                  :checked="selectedTags.includes(tag.id)"
                  class="hidden"
                  @change="toggleTag(tag.id)"
                />
                {{ tag.name }}
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <Button type="submit" variant="primary" class="flex-1" :loading="saving">
              发布
            </Button>
            <Button type="button" variant="secondary" class="flex-1" :loading="saving" @click="saveDraft">
              保存草稿
            </Button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Category, Tag } from '@blog/shared/types';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
});

const router = useRouter();
const uiStore = useUiStore();
const authStore = useAuthStore();

const title = ref('');
const content = ref('');
const excerpt = ref('');
const featured = ref(false);
const categoryId = ref('');
const selectedTags = ref<string[]>([]);
const categories = ref<Category[]>([]);
const allTags = ref<Tag[]>([]);
const saving = ref(false);

function toggleTag(tagId: string) {
  const idx = selectedTags.value.indexOf(tagId);
  if (idx >= 0) {
    selectedTags.value.splice(idx, 1);
  } else {
    selectedTags.value.push(tagId);
  }
}

async function savePost() {
  saving.value = true;
  try {
    const config = useRuntimeConfig();
    const res = await fetch(`${config.public.apiBase}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        title: title.value,
        content: content.value,
        excerpt: excerpt.value || undefined,
        featured: featured.value,
        category_id: categoryId.value || undefined,
        tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
        status: 'published',
      }),
    });
    const json = await res.json();
    if (json.success) {
      uiStore.showToast('success', '文章已发布');
      router.push('/admin/posts');
    } else {
      uiStore.showToast('error', json.message || '发布失败');
    }
  } catch {
    uiStore.showToast('error', '发布失败');
  } finally {
    saving.value = false;
  }
}

async function saveDraft() {
  saving.value = true;
  try {
    const config = useRuntimeConfig();
    const res = await fetch(`${config.public.apiBase}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        title: title.value,
        content: content.value,
        excerpt: excerpt.value || undefined,
        category_id: categoryId.value || undefined,
        tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
        status: 'draft',
      }),
    });
    const json = await res.json();
    if (json.success) {
      uiStore.showToast('success', '草稿已保存');
      router.push('/admin/posts');
    } else {
      uiStore.showToast('error', json.message || '保存失败');
    }
  } catch {
    uiStore.showToast('error', '保存失败');
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  try {
    const config = useRuntimeConfig();
    const [catRes, tagRes] = await Promise.all([
      fetch(`${config.public.apiBase}/categories`),
      fetch(`${config.public.apiBase}/tags`),
    ]);
    const catJson = await catRes.json();
    const tagJson = await tagRes.json();
    if (catJson.success) categories.value = catJson.data;
    if (tagJson.success) allTags.value = tagJson.data;
  } catch (e) {
    console.error('Failed to load categories/tags', e);
  }
});
</script>
