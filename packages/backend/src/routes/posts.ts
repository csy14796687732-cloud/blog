import { Hono } from 'hono';
import { authMiddleware, adminMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPostSchema, updatePostSchema } from '@blog/shared/validations';
import {
  getPosts,
  getFeaturedPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getRelatedPosts,
} from '../services/posts.service';
import { getPaginationParams, paginatedResponse } from '../utils/pagination';
import { successResponse } from '../utils/response';
import type { PostFilterParams } from '@blog/shared/types';

const router = new Hono();

router.get('/', optionalAuthMiddleware, async (c) => {
  const params: PostFilterParams = {
    ...getPaginationParams(c),
    category: c.req.query('category'),
    tag: c.req.query('tag'),
    status: c.req.query('status'),
    search: c.req.query('search'),
  };
  const result = await getPosts(params);
  return paginatedResponse(result.items, result.total, result.page, result.pageSize);
});

router.get('/featured', async (c) => {
  const posts = await getFeaturedPosts();
  return successResponse(c, posts);
});

router.get('/slug/:slug', optionalAuthMiddleware, async (c) => {
  const slug = c.req.param('slug');
  const post = await getPostBySlug(slug);
  return successResponse(c, post);
});

router.get('/:id', optionalAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const post = await getPostById(id);
  return successResponse(c, post);
});

router.get('/:id/related', async (c) => {
  const id = c.req.param('id');
  const limit = parseInt(c.req.query('limit') || '3', 10);
  const related = await getRelatedPosts(id, limit);
  return successResponse(c, related);
});

router.post('/', authMiddleware, adminMiddleware, validate(createPostSchema), async (c) => {
  const data = c.get('validated');
  const userId = c.get('userId');
  const post = await createPost(data, userId);
  return successResponse(c, post, '文章已创建', 201);
});

router.put('/:id', authMiddleware, adminMiddleware, validate(updatePostSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.get('validated');
  const post = await updatePost(id, data);
  return successResponse(c, post, '文章已更新');
});

router.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  await deletePost(id);
  return successResponse(c, null, '文章已删除');
});

export { router as postsRouter };
