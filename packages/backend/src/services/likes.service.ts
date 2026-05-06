import { db } from '../db';
import { likes } from '../db/schema';
import { eq, and, count } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

export async function toggleLike(postId: string, userId: string) {
  const [existing] = await db
    .select()
    .from(likes)
    .where(and(eq(likes.post_id, postId), eq(likes.user_id, userId)))
    .limit(1);

  if (existing) {
    await db
      .delete(likes)
      .where(and(eq(likes.post_id, postId), eq(likes.user_id, userId)));
    return { liked: false };
  }

  await db.insert(likes).values({
    post_id: postId,
    user_id: userId,
  });

  return { liked: true };
}

export async function getLikeStatus(postId: string, userId: string) {
  const [existing] = await db
    .select()
    .from(likes)
    .where(and(eq(likes.post_id, postId), eq(likes.user_id, userId)))
    .limit(1);

  const [countResult] = await db
    .select({ count: count() })
    .from(likes)
    .where(eq(likes.post_id, postId));

  return {
    liked: !!existing,
    count: countResult.count,
  };
}

export async function getPostLikeCount(postId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(likes)
    .where(eq(likes.post_id, postId));

  return result.count;
}
