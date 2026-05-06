import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTagSchema, updateTagSchema } from '@blog/shared/validations';
import {
  getAllTags,
  getTagBySlug,
  createTag,
  updateTag,
  deleteTag,
} from '../services/tags.service';
import { successResponse } from '../utils/response';

const router = new Hono();

router.get('/', async (c) => {
  const tags = await getAllTags();
  return successResponse(c, tags);
});

router.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const tag = await getTagBySlug(slug);
  return successResponse(c, tag);
});

router.post('/', authMiddleware, adminMiddleware, validate(createTagSchema), async (c) => {
  const data = c.get('validated');
  const tag = await createTag(data);
  return successResponse(c, tag, '标签已创建', 201);
});

router.put('/:id', authMiddleware, adminMiddleware, validate(updateTagSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.get('validated');
  const tag = await updateTag(id, data);
  return successResponse(c, tag, '标签已更新');
});

router.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  await deleteTag(id);
  return successResponse(c, null, '标签已删除');
});

export { router as tagsRouter };
