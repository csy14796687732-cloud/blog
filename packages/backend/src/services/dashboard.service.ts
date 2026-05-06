import { db } from '../db';
import { posts, comments, users, likes, pageViews, categories, tags } from '../db/schema';
import { eq, count, desc, sql, and, gte, SQL } from 'drizzle-orm';

export async function getDashboardStats() {
  const [postCounts] = await db
    .select({
      total: count(),
      published: sql<number>`SUM(CASE WHEN ${posts.status} = 'published' THEN 1 ELSE 0 END)`,
      draft: sql<number>`SUM(CASE WHEN ${posts.status} = 'draft' THEN 1 ELSE 0 END)`,
    })
    .from(posts);

  const [commentCounts] = await db
    .select({
      total: count(),
      pending: sql<number>`SUM(CASE WHEN ${comments.status} = 'pending' THEN 1 ELSE 0 END)`,
    })
    .from(comments);

  const [userCount] = await db
    .select({ count: count() })
    .from(users);

  const [viewCount] = await db
    .select({ count: count() })
    .from(pageViews);

  const [categoryCount] = await db
    .select({ count: count() })
    .from(categories);

  const [tagCount] = await db
    .select({ count: count() })
    .from(tags);

  return {
    totalPosts: Number(postCounts.total),
    publishedPosts: Number(postCounts.published) || 0,
    draftPosts: Number(postCounts.draft) || 0,
    totalComments: Number(commentCounts.total),
    pendingComments: Number(commentCounts.pending) || 0,
    totalUsers: Number(userCount.count),
    totalViews: Number(viewCount.count),
    totalCategories: Number(categoryCount.count),
    totalTags: Number(tagCount.count),
  };
}

export async function getViewsTrend(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select({
      date: sql<string>`DATE(${pageViews.created_at})`,
      count: count(),
    })
    .from(pageViews)
    .where(gte(pageViews.created_at, startDate))
    .groupBy(sql`DATE(${pageViews.created_at})`)
    .orderBy(sql`DATE(${pageViews.created_at})`);

  return result.map((r) => ({
    date: r.date,
    count: Number(r.count),
  }));
}

export async function getPopularPosts(limit = 10) {
  const popularPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      view_count: posts.view_count,
    })
    .from(posts)
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.view_count))
    .limit(limit);

  const enriched = await Promise.all(
    popularPosts.map(async (post) => {
      const [likeCount] = await db
        .select({ count: count() })
        .from(likes)
        .where(eq(likes.post_id, post.id));

      const [commentCount] = await db
        .select({ count: count() })
        .from(comments)
        .where(
          and(eq(comments.post_id, post.id), eq(comments.status, 'approved')),
        );

      return {
        ...post,
        view_count: Number(post.view_count),
        like_count: Number(likeCount.count),
        comment_count: Number(commentCount.count),
      };
    }),
  );

  return enriched;
}
