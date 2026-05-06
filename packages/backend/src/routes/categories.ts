import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '@blog/shared/validations';
import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categories.service';
import { successResponse } from '../utils/response';

const router = new Hono();

router.get('/', async (c) => {
  const categories = await getAllCategories();
  return successResponse(c, categories);
});

router.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const category = await getCategoryBySlug(slug);
  return successResponse(c, category);
});

router.post('/', authMiddleware, adminMiddleware, validate(createCategorySchema), async (c) => {
  const data = c.get('validated');
  const category = await createCategory(data);
  return successResponse(c, category, '分类已创建', 201);
});

router.put('/:id', authMiddleware, adminMiddleware, validate(updateCategorySchema), async (c) => {
  const id = c.req.param('id');
  const data = c.get('validated');
  const category = await updateCategory(id, data);
  return successResponse(c, category, '分类已更新');
});

router.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  await deleteCategory(id);
  return successResponse(c, null, '分类已删除');
});

export { router as categoriesRouter };
