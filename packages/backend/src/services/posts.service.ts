import { db } from '../db';
import { posts, categories, tags, postTags, likes, comments, users } from '../db/schema';
import { eq, and, or, like, desc, asc, sql, count, isNull, ne } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { generateUniqueSlug } from '../shared/utils/index.js';
import type { PostWithRelations, PostFilterParams } from '../shared/types/index.js';

const postWithRelations = {
  author: {
    columns: {
      id: true,
      username: true,
      display_name: true,
      avatar: true,
      bio: true,
      role: true,
      created_at: true,
    },
  },
  category: true,
};

async function enrichPost(post: typeof posts.$inferSelect): Promise<PostWithRelations> {
  const [author] = await db
    .select({
      id: users.id,
      username: users.username,
      display_name: users.display_name,
      avatar: users.avatar,
      bio: users.bio,
      role: users.role,
      created_at: users.created_at,
    })
    .from(users)
    .where(eq(users.id, post.author_id))
    .limit(1);

  const category = post.category_id
    ? await db
        .select()
        .from(categories)
        .where(eq(categories.id, post.category_id))
        .limit(1)
        .then((r) => r[0] || null)
    : null;

  const postTagsList = await db
    .select({ tag: tags })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tag_id, tags.id))
    .where(eq(postTags.post_id, post.id));

  const [likeCount] = await db
    .select({ count: count() })
    .from(likes)
    .where(eq(likes.post_id, post.id));

  const [commentCount] = await db
    .select({ count: count() })
    .from(comments)
    .where(and(eq(comments.post_id, post.id), eq(comments.status, 'approved')));

  return {
    ...post,
    author: author || {
      id: post.author_id,
      username: 'unknown',
      display_name: 'Unknown',
      avatar: null,
      bio: null,
      role: 'user' as const,
      created_at: new Date(),
    },
    category,
    tags: postTagsList.map((pt) => pt.tag),
    like_count: likeCount.count,
    comment_count: commentCount.count,
    published_at: post.published_at,
    created_at: post.created_at,
    updated_at: post.updated_at,
  };
}

export async function getPosts(params: PostFilterParams) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const conditions = [];

  if (params.status) {
    conditions.push(eq(posts.status, params.status as 'draft' | 'published'));
  } else {
    conditions.push(eq(posts.status, 'published'));
  }

  if (params.category) {
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, params.category))
      .limit(1)
      .then((r) => r[0]);
    if (category) {
      conditions.push(eq(posts.category_id, category.id));
    }
  }

  if (params.tag) {
    const tag = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, params.tag))
      .limit(1)
      .then((r) => r[0]);
    if (tag) {
      const postIds = await db
        .select({ post_id: postTags.post_id })
        .from(postTags)
        .where(eq(postTags.tag_id, tag.id));
      conditions.push(
        sql`${posts.id} IN (${postIds.map((p) => p.post_id).join(',')})`,
      );
    }
  }

  if (params.search) {
    conditions.push(
      or(
        like(posts.title, `%${params.search}%`),
        like(posts.content, `%${params.search}%`),
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(posts)
    .where(whereClause);

  const postsList = await db
    .select()
    .from(posts)
    .where(whereClause)
    .orderBy(desc(posts.created_at))
    .limit(pageSize)
    .offset(offset);

  const enrichedPosts = await Promise.all(postsList.map(enrichPost));

  return {
    items: enrichedPosts,
    total: totalResult.count,
    page,
    pageSize,
    totalPages: Math.ceil(totalResult.count / pageSize),
  };
}

export async function getFeaturedPosts() {
  const featuredPosts = await db
    .select()
    .from(posts)
    .where(and(eq(posts.featured, true), eq(posts.status, 'published')))
    .orderBy(desc(posts.created_at))
    .limit(5);

  return Promise.all(featuredPosts.map(enrichPost));
}

export async function getPostById(id: string) {
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!post) {
    throw new HTTPException(404, { message: '文章不存在' });
  }

  return enrichPost(post);
}

export async function getPostBySlug(slug: string) {
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  if (!post || post.status === 'draft') {
    throw new HTTPException(404, { message: '文章不存在' });
  }

  // Increment view count
  await db
    .update(posts)
    .set({ view_count: post.view_count + 1 })
    .where(eq(posts.id, post.id));

  return enrichPost(post);
}

export async function createPost(
  data: {
    title: string;
    content: string;
    excerpt?: string;
    cover_image?: string;
    status?: 'draft' | 'published';
    featured?: boolean;
    category_id?: string;
    tags?: string[];
  },
  authorId: string,
) {
  const slug = generateUniqueSlug(data.title);

  const [post] = await db
    .insert(posts)
    .values({
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt || null,
      cover_image: data.cover_image || null,
      status: data.status || 'draft',
      featured: data.featured || false,
      author_id: authorId,
      category_id: data.category_id || null,
      published_at: data.status === 'published' ? new Date() : null,
    })
    .returning();

  if (data.tags && data.tags.length > 0) {
    await db.insert(postTags).values(
      data.tags.map((tagId) => ({
        post_id: post.id,
        tag_id: tagId,
      })),
    );
  }

  return enrichPost(post);
}

export async function updatePost(
  id: string,
  data: {
    title?: string;
    content?: string;
    excerpt?: string;
    cover_image?: string;
    status?: 'draft' | 'published';
    featured?: boolean;
    category_id?: string | null;
    tags?: string[];
  },
) {
  const [existing] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!existing) {
    throw new HTTPException(404, { message: '文章不存在' });
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date(),
  };

  if (data.title) updateData.title = data.title;
  if (data.content) updateData.content = data.content;
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
  if (data.cover_image !== undefined) updateData.cover_image = data.cover_image;
  if (data.featured !== undefined) updateData.featured = data.featured;
  if (data.category_id !== undefined) updateData.category_id = data.category_id;

  if (data.status) {
    updateData.status = data.status;
    if (data.status === 'published' && !existing.published_at) {
      updateData.published_at = new Date();
    }
  }

  const [updated] = await db
    .update(posts)
    .set(updateData)
    .where(eq(posts.id, id))
    .returning();

  if (data.tags !== undefined) {
    await db.delete(postTags).where(eq(postTags.post_id, id));
    if (data.tags.length > 0) {
      await db.insert(postTags).values(
        data.tags.map((tagId) => ({
          post_id: id,
          tag_id: tagId,
        })),
      );
    }
  }

  return enrichPost(updated);
}

export async function deletePost(id: string) {
  const [existing] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!existing) {
    throw new HTTPException(404, { message: '文章不存在' });
  }

  await db.delete(posts).where(eq(posts.id, id));
}

export async function getRelatedPosts(postId: string, limit = 3) {
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) return [];

  const postTagIds = await db
    .select({ tag_id: postTags.tag_id })
    .from(postTags)
    .where(eq(postTags.post_id, postId));

  let related: (typeof posts.$inferSelect)[] = [];

  if (postTagIds.length > 0) {
    const tagIds = postTagIds.map((pt) => pt.tag_id);
    const relatedPostIds = await db
      .select({ post_id: postTags.post_id })
      .from(postTags)
      .where(
        and(
          sql`${postTags.tag_id} IN (${tagIds.join(',')})`,
          ne(postTags.post_id, postId),
        ),
      );

    const uniqueIds = [...new Set(relatedPostIds.map((r) => r.post_id))].slice(0, limit);

    if (uniqueIds.length > 0) {
      related = await db
        .select()
        .from(posts)
        .where(
          and(
            sql`${posts.id} IN (${uniqueIds.join(',')})`,
            eq(posts.status, 'published'),
          ),
        )
        .limit(limit);
    }
  }

  if (related.length < limit && post.category_id) {
    const morePosts = await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.category_id, post.category_id),
          ne(posts.id, postId),
          eq(posts.status, 'published'),
        ),
      )
      .limit(limit - related.length);

    related = [...related, ...morePosts];
  }

  return Promise.all(related.map(enrichPost));
}

export async function searchPosts(query: string, page = 1, pageSize = 10) {
  return getPosts({
    search: query,
    page,
    pageSize,
    status: 'published',
  });
}
