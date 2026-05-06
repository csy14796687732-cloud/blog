import { Hono } from 'hono';
import { db } from '../db';
import { posts, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const router = new Hono();

router.get('/', async (c) => {
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const postsList = await db
    .select()
    .from(posts)
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.published_at))
    .limit(20);

  const rssItems = await Promise.all(
    postsList.map(async (post) => {
      const [author] = await db
        .select()
        .from(users)
        .where(eq(users.id, post.author_id))
        .limit(1);

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/posts/${post.slug}</link>
      <guid>${siteUrl}/posts/${post.slug}</guid>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <pubDate>${post.published_at ? new Date(post.published_at).toUTCString() : ''}</pubDate>
      <author>${author?.email || ''} (${author?.display_name || ''})</author>
    </item>`;
    }),
  );

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>个人博客</title>
    <link>${siteUrl}</link>
    <description>个人博客 - 分享技术与生活</description>
    <language>zh-cn</language>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml"/>
    ${rssItems.join('')}
  </channel>
</rss>`;

  c.res.headers.set('Content-Type', 'application/rss+xml; charset=utf-8');
  return c.body(rss);
});

export { router as rssRouter };
