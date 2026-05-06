<template>
  <div>
    <h2 class="mb-6 text-center text-2xl font-bold text-slate-800 dark:text-slate-100">
      登录
    </h2>
    <form class="space-y-4" @submit.prevent="handleLogin">
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
          密码
        </label>
        <input
          v-model="password"
          type="password"
          required
          class="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-700"
          placeholder="请输入密码"
        />
      </div>
      <Button type="submit" :loading="authStore.loading" class="w-full">
        登录
      </Button>
    </form>
    <p class="mt-4 text-center text-sm text-slate-500">
      还没有账号？
      <NuxtLink to="/auth/register" class="font-medium text-primary-600 hover:text-primary-700">
        立即注册
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

const email = ref('');
const password = ref('');

async function handleLogin() {
  try {
    await authStore.login({ email: email.value, password: password.value });
    uiStore.showToast('success', '登录成功');
    router.push('/admin');
  } catch (e: any) {
    uiStore.showToast('error', e.message || '登录失败');
  }
}
</script>
