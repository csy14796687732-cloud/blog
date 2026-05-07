import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCommentSchema, updateCommentSchema } from '../shared/validations/index.js';
import {
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  getAllComments,
  updateCommentStatus,
} from '../services/comments.service';
import { getPaginationParams, paginatedResponse } from '../utils/pagination';
import { successResponse } from '../utils/response';

const router = new Hono();

// Post comments (public)
router.get('/posts/:postId/comments', async (c) => {
  const postId = c.req.param('postId');
  const { page, pageSize } = getPaginationParams(c);
  const result = await getPostComments(postId, page, pageSize);
  return paginatedResponse(result.items, result.total, result.page, result.pageSize);
});

router.post('/posts/:postId/comments', authMiddleware, validate(createCommentSchema), async (c) => {
  const postId = c.req.param('postId');
  const userId = c.get('userId');
  const data = c.get('validated');
  const comment = await createComment(postId, userId, data);
  return successResponse(c, comment, '评论已提交，等待审核', 201);
});

// Single comment operations
router.put('/comments/:id', authMiddleware, validate(updateCommentSchema), async (c) => {
  const id = c.req.param('id');
  const userId = c.get('userId');
  const data = c.get('validated');
  const comment = await updateComment(id, userId, data.content);
  return successResponse(c, comment, '评论已更新');
});

router.delete('/comments/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  await deleteComment(id, userId, userRole);
  return successResponse(c, null, '评论已删除');
});

// Admin comment management
router.get('/admin/comments', authMiddleware, adminMiddleware, async (c) => {
  const { page, pageSize } = getPaginationParams(c);
  const status = c.req.query('status');
  const result = await getAllComments(page, pageSize, status);
  return paginatedResponse(result.items, result.total, result.page, result.pageSize);
});

router.put('/admin/comments/:id/status', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json();
  const comment = await updateCommentStatus(id, status);
  return successResponse(c, comment, '评论状态已更新');
});

export { router as commentsRouter };
