<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">分类管理</h2>
      <Button @click="showCreateModal = true">
        新建分类
      </Button>
    </div>

    <!-- Create/Edit Modal -->
    <Modal v-model="showCreateModal" :title="editingId ? '编辑分类' : '新建分类'">
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
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">描述</label>
          <textarea
            v-model="formDescription"
            rows="2"
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
          <tr v-for="cat in categories" :key="cat.id" class="border-b last:border-0 dark:border-slate-700">
            <td class="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{{ cat.name }}</td>
            <td class="px-4 py-3 text-slate-500">{{ cat.slug }}</td>
            <td class="px-4 py-3 text-slate-500">{{ cat.post_count }}</td>
            <td class="px-4 py-3">
              <div class="flex gap-2">
                <button class="text-primary-600 hover:text-primary-700" @click="editCategory(cat)">编辑</button>
                <button class="text-red-500 hover:text-red-600" @click="deleteCategory(cat.id)">删除</button>
              </div>
            </td>
          </tr>
          <tr v-if="categories.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-slate-400">暂无分类</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '@blog/shared/types';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const api = useApi();
const uiStore = useUiStore();

const categories = ref<Category[]>([]);
const loading = ref(true);
const showCreateModal = ref(false);
const editingId = ref<string | null>(null);
const formName = ref('');
const formDescription = ref('');

async function loadCategories() {
  loading.value = true;
  try {
    const res = await api.get<Category[]>('/categories');
    if (res.success) categories.value = res.data || [];
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  try {
    if (editingId.value) {
      await api.put(`/categories/${editingId.value}`, {
        name: formName.value,
        description: formDescription.value,
      });
      uiStore.showToast('success', '分类已更新');
    } else {
      await api.post('/categories', {
        name: formName.value,
        description: formDescription.value,
      });
      uiStore.showToast('success', '分类已创建');
    }
    showCreateModal.value = false;
    resetForm();
    await loadCategories();
  } catch {
    uiStore.showToast('error', '操作失败');
  }
}

function editCategory(cat: Category) {
  editingId.value = cat.id;
  formName.value = cat.name;
  formDescription.value = cat.description || '';
  showCreateModal.value = true;
}

async function deleteCategory(id: string) {
  const confirmed = await uiStore.showConfirm('确认删除', '确定要删除此分类吗？');
  if (confirmed) {
    try {
      await api.delete(`/categories/${id}`);
      uiStore.showToast('success', '分类已删除');
      await loadCategories();
    } catch {
      uiStore.showToast('error', '删除失败');
    }
  }
}

function resetForm() {
  editingId.value = null;
  formName.value = '';
  formDescription.value = '';
}

onMounted(loadCategories);
</script>
