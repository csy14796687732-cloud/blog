import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth';
import { HTTPException } from 'hono/http-exception';
import type { UserPublic } from '@blog/shared/types';

function toPublicUser(user: typeof users.$inferSelect): UserPublic {
  return {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    avatar: user.avatar,
    bio: user.bio,
    role: user.role,
    created_at: user.created_at.toISOString(),
  };
}

export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
  display_name?: string;
}) {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new HTTPException(409, { message: '该邮箱已被注册' });
  }

  const existingUsername = await db
    .select()
    .from(users)
    .where(eq(users.username, data.username))
    .limit(1);

  if (existingUsername.length > 0) {
    throw new HTTPException(409, { message: '该用户名已被使用' });
  }

  const password_hash = await bcrypt.hash(data.password, 12);
  const displayName = data.display_name || data.username;

  const [newUser] = await db
    .insert(users)
    .values({
      username: data.username,
      email: data.email,
      password_hash,
      display_name: displayName,
      role: 'user',
    })
    .returning();

  const token = generateToken(newUser.id, newUser.role);

  return {
    user: toPublicUser(newUser),
    token,
  };
}

export async function loginUser(email: string, password: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new HTTPException(401, { message: '邮箱或密码错误' });
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new HTTPException(401, { message: '邮箱或密码错误' });
  }

  const token = generateToken(user.id, user.role);

  return {
    user: toPublicUser(user),
    token,
  };
}

export async function getCurrentUser(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new HTTPException(404, { message: '用户不存在' });
  }

  return toPublicUser(user);
}

export async function updateProfile(
  userId: string,
  data: { display_name?: string; bio?: string; avatar?: string },
) {
  const [updated] = await db
    .update(users)
    .set({
      ...data,
      updated_at: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  if (!updated) {
    throw new HTTPException(404, { message: '用户不存在' });
  }

  return toPublicUser(updated);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new HTTPException(404, { message: '用户不存在' });
  }

  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    throw new HTTPException(400, { message: '当前密码错误' });
  }

  const password_hash = await bcrypt.hash(newPassword, 12);
  await db
    .update(users)
    .set({ password_hash, updated_at: new Date() })
    .where(eq(users.id, userId));
}

export async function getAdminUser() {
  const [admin] = await db
    .select()
    .from(users)
    .where(eq(users.role, 'admin'))
    .limit(1);

  return admin || null;
}
