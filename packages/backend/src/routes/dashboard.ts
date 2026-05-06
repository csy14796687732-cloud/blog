import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import {
  getDashboardStats,
  getViewsTrend,
  getPopularPosts,
} from '../services/dashboard.service';
import { successResponse } from '../utils/response';

const router = new Hono();

router.get('/stats', authMiddleware, adminMiddleware, async (c) => {
  const stats = await getDashboardStats();
  return successResponse(c, stats);
});

router.get('/views', authMiddleware, adminMiddleware, async (c) => {
  const days = parseInt(c.req.query('days') || '30', 10);
  const trend = await getViewsTrend(days);
  return successResponse(c, trend);
});

router.get('/popular-posts', authMiddleware, adminMiddleware, async (c) => {
  const limit = parseInt(c.req.query('limit') || '10', 10);
  const posts = await getPopularPosts(limit);
  return successResponse(c, posts);
});

export { router as dashboardRouter };
