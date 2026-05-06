import { Hono } from 'hono';
import { searchPosts } from '../services/posts.service';
import { getPaginationParams, paginatedResponse } from '../utils/pagination';

const router = new Hono();

router.get('/', async (c) => {
  const q = c.req.query('q');
  if (!q) {
    return paginatedResponse([], 0, 1, 10);
  }

  const { page, pageSize } = getPaginationParams(c);
  const result = await searchPosts(q, page, pageSize);
  return paginatedResponse(result.items, result.total, result.page, result.pageSize);
});

export { router as searchRouter };
