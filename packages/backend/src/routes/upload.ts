import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { successResponse } from '../utils/response';
import { HTTPException } from 'hono/http-exception';
import { writeFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { randomUUID } from 'node:crypto';

const router = new Hono();

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10);
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

router.post('/', authMiddleware, adminMiddleware, async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    throw new HTTPException(400, { message: '请上传文件' });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new HTTPException(400, { message: '仅支持 JPG、PNG、GIF、WebP 格式' });
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new HTTPException(400, { message: '文件大小不能超过 5MB' });
  }

  const ext = extname(file.name) || '.png';
  const filename = `${randomUUID()}${ext}`;
  const uploadPath = join(UPLOAD_DIR, filename);

  await mkdir(UPLOAD_DIR, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(uploadPath, buffer);

  const url = `/uploads/${filename}`;

  return successResponse(c, { url, filename }, '上传成功', 201);
});

export { router as uploadRouter };
