/**
 * Local development server entry point (Bun).
 * For Vercel deployment, see ../api/index.ts
 */
import { serve } from 'bun';
import app, { seedAdmin } from './app';

const port = parseInt(process.env.PORT || '3001', 10);

// Serve uploaded files (local only — on Vercel, use external storage)
app.get('/uploads/:filename', async (c) => {
  const filename = c.req.param('filename');
  const file = Bun.file(`./uploads/${filename}`);
  if (await file.exists()) {
    return new Response(file);
  }
  return c.json({ success: false, message: '文件不存在' }, 404);
});

async function start() {
  await seedAdmin();
  console.log(`Server running at http://localhost:${port}`);

  serve({
    fetch: app.fetch,
    port,
  });
}

start();
