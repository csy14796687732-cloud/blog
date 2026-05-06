export function usePageMeta(title: string, description?: string, image?: string) {
  const siteTitle = `个人博客`;
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  useHead({
    title,
    titleTemplate: `%s | ${siteTitle}`,
    meta: [
      { name: 'description', content: description || '个人博客 - 分享技术与生活' },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description || '个人博客 - 分享技术与生活' },
      { property: 'og:image', content: image || '/og-image.png' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description || '个人博客 - 分享技术与生活' },
      { name: 'twitter:image', content: image || '/og-image.png' },
    ],
  });
}
