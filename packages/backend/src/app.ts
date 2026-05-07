import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler, notFoundHandler } from './middleware/error';
import { authRouter } from './routes/auth';
import { postsRouter } from './routes/posts';
import { categoriesRouter } from './routes/categories';
import { tagsRouter } from './routes/tags';
import { commentsRouter } from './routes/comments';
import { likesRouter } from './routes/likes';
import { dashboardRouter } from './routes/dashboard';
import { uploadRouter } from './routes/upload';
import { searchRouter } from './routes/search';
import { rssRouter } from './routes/rss';
import { sitemapRouter } from './routes/sitemap';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const app = new Hono();

// Global CORS - allow Vercel preview URLs and production URL
app.use('/*', cors({
  origin: '*',
  credentials: true,
}));

// Public routes
app.route('/api/auth', authRouter);
app.route('/api/posts', postsRouter);
app.route('/api/categories', categoriesRouter);
app.route('/api/tags', tagsRouter);
app.route('/api/search', searchRouter);
app.route('/api/rss', rssRouter);
app.route('/api/sitemap', sitemapRouter);

// Mixed public/admin routes
app.route('/api', commentsRouter);

// Protected routes
app.route('/api', likesRouter);
app.route('/api/dashboard', dashboardRouter);
app.route('/api/upload', uploadRouter);

// Health check
app.get('/api/health', (c) => {
  return c.json({ success: true, message: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.onError(errorHandler);
app.notFound(notFoundHandler);

// Auto-create admin user (called once per cold start on Vercel)
let adminSeeded = false;

export async function seedAdmin() {
  if (adminSeeded) return;
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@blog.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (!existingAdmin) {
      const password_hash = await bcrypt.hash(adminPassword, 12);
      await db.insert(users).values({
        username: 'admin',
        email: adminEmail,
        password_hash,
        display_name: '管理员',
        role: 'admin' as const,
      });
      console.log('Admin user created successfully');
    }
    adminSeeded = true;
  } catch (error) {
    console.error('Failed to seed admin user (may already exist):', error);
    adminSeeded = true; // Don't retry on error
  }
}

export default app;
