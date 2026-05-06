<template>
  <div class="mx-auto max-w-3xl px-4 py-12">
    <h1 class="mb-8 text-3xl font-bold text-slate-800 dark:text-slate-100">
      关于我
    </h1>

    <div class="prose-custom mb-8">
      <p>
        欢迎来到我的个人博客！这里是我分享技术心得、生活感悟和个人思考的空间。
      </p>
      <p>
        我是一名软件开发工程师，专注于 Web 开发和技术架构。通过这个博客，我希望能够：
      </p>
      <ul>
        <li>记录和分享技术学习的经验</li>
        <li>探讨前沿的技术趋势和最佳实践</li>
        <li>分享阅读和思考的收获</li>
        <li>与志同道合的朋友交流</li>
      </ul>
      <h2>技术栈</h2>
      <p>
        这个博客本身也是我的一个实践项目，使用了以下技术构建：
      </p>
      <ul>
        <li><strong>前端：</strong> Nuxt 3 + Vue 3 + TypeScript + Tailwind CSS</li>
        <li><strong>后端：</strong> Hono + TypeScript + Drizzle ORM</li>
        <li><strong>数据库：</strong> PostgreSQL</li>
        <li><strong>部署：</strong> Docker + Docker Compose</li>
      </ul>
      <h2>联系方式</h2>
      <p>
        如果你有任何问题或建议，欢迎通过以下方式联系我：
      </p>
      <ul>
        <li>Email：admin@blog.com</li>
        <li>GitHub：github.com/blogger</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
usePageMeta('关于', '了解博主和技术博客');
</script>
