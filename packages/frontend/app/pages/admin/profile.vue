<template>
  <div class="mx-auto max-w-2xl">
    <h2 class="mb-6 text-2xl font-bold text-slate-800 dark:text-slate-100">个人设置</h2>

    <div class="space-y-8">
      <!-- Profile Info -->
      <section class="rounded-lg border bg-white p-6 dark:bg-slate-800">
        <h3 class="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-300">基本信息</h3>
        <form class="space-y-4" @submit.prevent="updateProfile">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">用户名</label>
            <input
              v-model="username"
              type="text"
              disabled
              class="w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm dark:bg-slate-700"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">邮箱</label>
            <input
              v-model="email"
              type="email"
              disabled
              class="w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm dark:bg-slate-700"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">显示名称</label>
            <input
              v-model="displayName"
              type="text"
              class="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:bg-slate-700"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">个人简介</label>
            <textarea
              v-model="bio"
              rows="3"
              class="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:bg-slate-700"
            />
          </div>
          <Button type="submit" :loading="profileLoading">保存修改</Button>
        </form>
      </section>

      <!-- Change Password -->
      <section class="rounded-lg border bg-white p-6 dark:bg-slate-800">
        <h3 class="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-300">修改密码</h3>
        <form class="space-y-4" @submit.prevent="changePwd">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">当前密码</label>
            <input
              v-model="currentPassword"
              type="password"
              required
              class="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:bg-slate-700"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">新密码</label>
            <input
              v-model="newPassword"
              type="password"
              required
              minlength="6"
              class="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:bg-slate-700"
            />
          </div>
          <Button type="submit" :loading="pwdLoading">修改密码</Button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' });

const authStore = useAuthStore();
const uiStore = useUiStore();

const username = ref('');
const email = ref('');
const displayName = ref('');
const bio = ref('');
const profileLoading = ref(false);

const currentPassword = ref('');
const newPassword = ref('');
const pwdLoading = ref(false);

onMounted(() => {
  if (authStore.user) {
    username.value = authStore.user.username;
    email.value = authStore.user.email;
    displayName.value = authStore.user.display_name;
    bio.value = authStore.user.bio || '';
  }
});

async function updateProfile() {
  profileLoading.value = true;
  try {
    await authStore.updateProfile({
      display_name: displayName.value || undefined,
      bio: bio.value || undefined,
    });
    uiStore.showToast('success', '资料已更新');
  } catch {
    uiStore.showToast('error', '更新失败');
  } finally {
    profileLoading.value = false;
  }
}

async function changePwd() {
  pwdLoading.value = true;
  try {
    const res = await authStore.changePassword(currentPassword.value, newPassword.value);
    if (res.success) {
      uiStore.showToast('success', '密码已修改');
      currentPassword.value = '';
      newPassword.value = '';
    } else {
      uiStore.showToast('error', res.message || '修改失败');
    }
  } catch {
    uiStore.showToast('error', '修改失败');
  } finally {
    pwdLoading.value = false;
  }
}
</script>
