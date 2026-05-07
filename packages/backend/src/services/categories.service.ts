import { db } from '../db';
import { categories, posts } from '../db/schema';
import { eq, count, desc } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { generateSlug } from '../shared/utils/index.js';
import type { Category } from '../shared/types/index.js';

export async function getAllCategories() {
  const result = await db
    .select({
      category: categories,
      post_count: count(posts.id),
    })
    .from(categories)
    .leftJoin(posts, eq(posts.category_id, categories.id))
    .groupBy(categories.id)
    .orderBy(desc(categories.created_at));

  return result.map((r) => ({
    ...r.category,
    post_count: r.post_count,
  }));
}

export async function getCategoryBySlug(slug: string) {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (!category) {
    throw new HTTPException(404, { message: '分类不存在' });
  }

  return category;
}

export async function createCategory(data: { name: string; description?: string }) {
  const slug = generateSlug(data.name);

  const existing = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (existing.length > 0) {
    throw new HTTPException(409, { message: '该分类已存在' });
  }

  const [category] = await db
    .insert(categories)
    .values({
      name: data.name,
      slug,
      description: data.description || null,
    })
    .returning();

  return category;
}

export async function updateCategory(
  id: string,
  data: { name?: string; description?: string },
) {
  const [existing] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!existing) {
    throw new HTTPException(404, { message: '分类不存在' });
  }

  const updateData: Record<string, unknown> = {};
  if (data.name) {
    updateData.name = data.name;
    updateData.slug = generateSlug(data.name);
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  const [updated] = await db
    .update(categories)
    .set(updateData)
    .where(eq(categories.id, id))
    .returning();

  return updated;
}

export async function deleteCategory(id: string) {
  const [existing] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!existing) {
    throw new HTTPException(404, { message: '分类不存在' });
  }

  await db.delete(categories).where(eq(categories.id, id));
}
