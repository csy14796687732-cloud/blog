export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxt/image',
    '@nuxtjs/seo',
    '@nuxt/eslint',
    '@vueuse/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'blog-color-mode',
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: '个人博客',
      meta: [
        { name: 'description', content: '个人博客 - 分享技术与生活' },
        { property: 'og:title', content: '个人博客' },
        { property: 'og:description', content: '个人博客 - 分享技术与生活' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'alternate', type: 'application/rss+xml', title: 'RSS', href: '/api/rss' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  },

  tailwindcss: {
    configPath: '~/tailwind.config.ts',
    cssPath: '~/assets/css/main.css',
  },

  image: {
    domains: ['localhost'],
    format: ['webp'],
  },

  ssr: true,

  seo: {
    automaticDefaults: true,
  },

  routeRules: {
    '/': { prerender: true },
    '/posts': { prerender: true },
    '/about': { prerender: true },
    '/rss.xml': { redirect: '/api/rss' },
  },

  nitro: {
    preset: process.env.VERCEL ? 'vercel' : 'node-server',
    routeRules: {
      '/api/**': process.env.VERCEL
        ? { proxy: process.env.NUXT_PUBLIC_API_BASE || 'https://your-backend.vercel.app' }
        : { proxy: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001' },
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },
});
