import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { toggleLike, getLikeStatus } from '../services/likes.service';
import { successResponse } from '../utils/response';

const router = new Hono();

router.post('/posts/:postId/like', authMiddleware, async (c) => {
  const postId = c.req.param('postId');
  const userId = c.get('userId');
  const result = await toggleLike(postId, userId);
  return successResponse(c, result, result.liked ? '已点赞' : '已取消点赞');
});

router.delete('/posts/:postId/like', authMiddleware, async (c) => {
  const postId = c.req.param('postId');
  const userId = c.get('userId');
  const [existing] = await (await import('../db')).db
    .select()
    .from((await import('../db/schema')).likes)
    .where(
      (await import('drizzle-orm')).and(
        (await import('drizzle-orm')).eq(
          (await import('../db/schema')).likes.post_id,
          postId,
        ),
        (await import('drizzle-orm')).eq(
          (await import('../db/schema')).likes.user_id,
          userId,
        ),
      ),
    )
    .limit(1);

  if (existing) {
    await toggleLike(postId, userId);
  }
  return successResponse(c, { liked: false }, '已取消点赞');
});

router.get('/posts/:postId/like/status', authMiddleware, async (c) => {
  const postId = c.req.param('postId');
  const userId = c.get('userId');
  const status = await getLikeStatus(postId, userId);
  return successResponse(c, status);
});

export { router as likesRouter };
