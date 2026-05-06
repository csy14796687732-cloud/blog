import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export interface JwtPayload {
  userId: string;
  role: string;
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: '未提供认证令牌' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    c.set('userId', payload.userId);
    c.set('userRole', payload.role);
    await next();
  } catch {
    throw new HTTPException(401, { message: '认证令牌无效或已过期' });
  }
}

export async function adminMiddleware(c: Context, next: Next) {
  const role = c.get('userRole');
  if (role !== 'admin') {
    throw new HTTPException(403, { message: '需要管理员权限' });
  }
  await next();
}

export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
      c.set('userId', payload.userId);
      c.set('userRole', payload.role);
    } catch {
      // Ignore invalid tokens for optional auth
    }
  }
  await next();
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}
