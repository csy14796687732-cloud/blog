<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">标签管理</h2>
      <Button @click="showCreateModal = true">
        新建标签
      </Button>
    </div>

    <Modal v-model="showCreateModal" :title="editingId ? '编辑标签' : '新建标签'">
      <form class="space-y-4" @submit.prevent="handleSave">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">名称</label>
          <input
            v-model="formName"
            type="text"
            required
            class="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:bg-slate-700"
          />
        </div>
      </form>
      <template #footer>
        <Button variant="secondary" @click="showCreateModal = false">取消</Button>
        <Button @click="handleSave">{{ editingId ? '更新' : '创建' }}</Button>
      </template>
    </Modal>

    <LoadingSpinner v-if="loading" />

    <div v-else class="rounded-lg border bg-white dark:bg-slate-800">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b dark:border-slate-700">
            <th class="px-4 py-3 font-medium text-slate-500">名称</th>
            <th class="px-4 py-3 font-medium text-slate-500">Slug</th>
            <th class="px-4 py-3 font-medium text-slate-500">文章数</th>
            <th class="px-4 py-3 font-medium text-slate-500">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tag in tags" :key="tag.id" class="border-b last:border-0 dark:border-slate-700">
            <td class="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{{ tag.name }}</td>
            <td class="px-4 py-3 text-slate-500">{{ tag.slug }}</td>
            <td class="px-4 py-3 text-slate-500">{{ tag.post_count }}</td>
            <td class="px-4 py-3">
              <div class="flex gap-2">
                <button class="text-primary-600 hover:text-primary-700" @click="editTag(tag)">编辑</button>
                <button class="text-red-500 hover:text-red-600" @click="deleteTag(tag.id)">删除</button>
              </div>
            </td>
          </tr>
          <tr v-if="tags.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-slate-400">暂无标签</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Tag } from '@blog/shared/types';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const api = useApi();
const uiStore = useUiStore();

const tags = ref<Tag[]>([]);
const loading = ref(true);
const showCreateModal = ref(false);
const editingId = ref<string | null>(null);
const formName = ref('');

async function loadTags() {
  loading.value = true;
  try {
    const res = await api.get<Tag[]>('/tags');
    if (res.success) tags.value = res.data || [];
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  try {
    if (editingId.value) {
      await api.put(`/tags/${editingId.value}`, { name: formName.value });
      uiStore.showToast('success', '标签已更新');
    } else {
      await api.post('/tags', { name: formName.value });
      uiStore.showToast('success', '标签已创建');
    }
    showCreateModal.value = false;
    editingId.value = null;
    formName.value = '';
    await loadTags();
  } catch {
    uiStore.showToast('error', '操作失败');
  }
}

function editTag(tag: Tag) {
  editingId.value = tag.id;
  formName.value = tag.name;
  showCreateModal.value = true;
}

async function deleteTag(id: string) {
  const confirmed = await uiStore.showConfirm('确认删除', '确定要删除此标签吗？');
  if (confirmed) {
    try {
      await api.delete(`/tags/${id}`);
      uiStore.showToast('success', '标签已删除');
      await loadTags();
    } catch {
      uiStore.showToast('error', '删除失败');
    }
  }
}

onMounted(loadTags);
</script>
