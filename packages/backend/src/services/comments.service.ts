import { db } from '../db';
import { comments, users, posts } from '../db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

export async function getPostComments(postId: string, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;

  const [totalResult] = await db
    .select({ count: count() })
    .from(comments)
    .where(
      and(
        eq(comments.post_id, postId),
        eq(comments.status, 'approved'),
        eq(comments.parent_id, null as unknown as string),
      ),
    );

  const rootComments = await db
    .select()
    .from(comments)
    .where(
      and(
        eq(comments.post_id, postId),
        eq(comments.status, 'approved'),
        eq(comments.parent_id, null as unknown as string),
      ),
    )
    .orderBy(desc(comments.created_at))
    .limit(pageSize)
    .offset(offset);

  const enrichedComments = await Promise.all(
    rootComments.map(async (comment) => {
      const [user] = await db
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
        .where(eq(users.id, comment.user_id))
        .limit(1);

      const replies = await db
        .select()
        .from(comments)
        .where(
          and(
            eq(comments.parent_id, comment.id),
            eq(comments.status, 'approved'),
          ),
        )
        .orderBy(desc(comments.created_at));

      const enrichedReplies = await Promise.all(
        replies.map(async (reply) => {
          const [replyUser] = await db
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
            .where(eq(users.id, reply.user_id))
            .limit(1);

          return { ...reply, user: replyUser };
        }),
      );

      return { ...comment, user, replies: enrichedReplies };
    }),
  );

  return {
    items: enrichedComments,
    total: totalResult.count,
    page,
    pageSize,
    totalPages: Math.ceil(totalResult.count / pageSize),
  };
}

export async function createComment(
  postId: string,
  userId: string,
  data: { content: string; parent_id?: string | null },
) {
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    throw new HTTPException(404, { message: '文章不存在' });
  }

  if (data.parent_id) {
    const [parentComment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, data.parent_id))
      .limit(1);

    if (!parentComment) {
      throw new HTTPException(404, { message: '父评论不存在' });
    }
  }

  const [comment] = await db
    .insert(comments)
    .values({
      content: data.content,
      user_id: userId,
      post_id: postId,
      parent_id: data.parent_id || null,
      status: 'pending',
    })
    .returning();

  return comment;
}

export async function updateComment(
  commentId: string,
  userId: string,
  content: string,
) {
  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!comment) {
    throw new HTTPException(404, { message: '评论不存在' });
  }

  if (comment.user_id !== userId) {
    throw new HTTPException(403, { message: '无权编辑此评论' });
  }

  const [updated] = await db
    .update(comments)
    .set({ content })
    .where(eq(comments.id, commentId))
    .returning();

  return updated;
}

export async function deleteComment(commentId: string, userId: string, userRole: string) {
  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!comment) {
    throw new HTTPException(404, { message: '评论不存在' });
  }

  if (comment.user_id !== userId && userRole !== 'admin') {
    throw new HTTPException(403, { message: '无权删除此评论' });
  }

  await db.delete(comments).where(eq(comments.id, commentId));
}

export async function getAllComments(page = 1, pageSize = 20, status?: string) {
  const offset = (page - 1) * pageSize;
  const conditions = [];

  if (status) {
    conditions.push(
      eq(comments.status, status as 'pending' | 'approved' | 'rejected'),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(comments)
    .where(whereClause);

  const commentsList = await db
    .select()
    .from(comments)
    .where(whereClause)
    .orderBy(desc(comments.created_at))
    .limit(pageSize)
    .offset(offset);

  const enrichedComments = await Promise.all(
    commentsList.map(async (comment) => {
      const [user] = await db
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
        .where(eq(users.id, comment.user_id))
        .limit(1);

      return { ...comment, user };
    }),
  );

  return {
    items: enrichedComments,
    total: totalResult.count,
    page,
    pageSize,
    totalPages: Math.ceil(totalResult.count / pageSize),
  };
}

export async function updateCommentStatus(
  commentId: string,
  status: 'approved' | 'rejected',
) {
  const [existing] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!existing) {
    throw new HTTPException(404, { message: '评论不存在' });
  }

  const [updated] = await db
    .update(comments)
    .set({ status })
    .where(eq(comments.id, commentId))
    .returning();

  return updated;
}
