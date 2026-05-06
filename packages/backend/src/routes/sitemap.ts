import { Hono } from 'hono';
import { db } from '../db';
import { posts, categories, tags } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const router = new Hono();

router.get('/', async (c) => {
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const publishedPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.published_at));

  const allCategories = await db.select().from(categories);
  const allTags = await db.select().from(tags);

  const urls = [
    `
  <url>
    <loc>${siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
    `
  <url>
    <loc>${siteUrl}/posts</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`,
    `
  <url>
    <loc>${siteUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`,
  ];

  for (const category of allCategories) {
    urls.push(`
  <url>
    <loc>${siteUrl}/posts?category=${category.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
  }

  for (const tag of allTags) {
    urls.push(`
  <url>
    <loc>${siteUrl}/posts?tag=${tag.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
  }

  for (const post of publishedPosts) {
    urls.push(`
  <url>
    <loc>${siteUrl}/posts/${post.slug}</loc>
    <lastmod>${post.updated_at.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('')}
</urlset>`;

  c.res.headers.set('Content-Type', 'application/xml; charset=utf-8');
  return c.body(sitemap);
});

export { router as sitemapRouter };
