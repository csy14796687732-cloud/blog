<template>
  <div>
    <h2 class="mb-6 text-center text-2xl font-bold text-slate-800 dark:text-slate-100">
      注册
    </h2>
    <form class="space-y-4" @submit.prevent="handleRegister">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          用户名
        </label>
        <input
          v-model="username"
          type="text"
          required
          minlength="3"
          class="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-700"
          placeholder="请输入用户名"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          邮箱
        </label>
        <input
          v-model="email"
          type="email"
          required
          class="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-700"
          placeholder="请输入邮箱"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          显示名称（可选）
        </label>
        <input
          v-model="displayName"
          type="text"
          class="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-700"
          placeholder="请输入显示名称"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          密码
        </label>
        <input
          v-model="password"
          type="password"
          required
          minlength="6"
          class="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-700"
          placeholder="至少6个字符"
        />
      </div>
      <Button type="submit" :loading="authStore.loading" class="w-full">
        注册
      </Button>
    </form>
    <p class="mt-4 text-center text-sm text-slate-500">
      已有账号？
      <NuxtLink to="/auth/login" class="font-medium text-primary-600 hover:text-primary-700">
        立即登录
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
});

const authStore = useAuthStore();
const uiStore = useUiStore();
const router = useRouter();

const username = ref('');
const email = ref('');
const displayName = ref('');
const password = ref('');

async function handleRegister() {
  try {
    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
      display_name: displayName.value || undefined,
    });
    uiStore.showToast('success', '注册成功');
    router.push('/admin');
  } catch (e: any) {
    uiStore.showToast('error', e.message || '注册失败');
  }
}
</script>
