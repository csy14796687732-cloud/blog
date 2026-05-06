import { db } from '../db';
import { tags, postTags, posts } from '../db/schema';
import { eq, count, desc } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { generateSlug } from '@blog/shared/utils';

export async function getAllTags() {
  const result = await db
    .select({
      tag: tags,
      post_count: count(postTags.post_id),
    })
    .from(tags)
    .leftJoin(postTags, eq(postTags.tag_id, tags.id))
    .groupBy(tags.id)
    .orderBy(desc(tags.created_at));

  return result.map((r) => ({
    ...r.tag,
    post_count: r.post_count,
  }));
}

export async function getTagBySlug(slug: string) {
  const [tag] = await db
    .select()
    .from(tags)
    .where(eq(tags.slug, slug))
    .limit(1);

  if (!tag) {
    throw new HTTPException(404, { message: '标签不存在' });
  }

  return tag;
}

export async function createTag(data: { name: string }) {
  const slug = generateSlug(data.name);

  const existing = await db
    .select()
    .from(tags)
    .where(eq(tags.slug, slug))
    .limit(1);

  if (existing.length > 0) {
    throw new HTTPException(409, { message: '该标签已存在' });
  }

  const [tag] = await db
    .insert(tags)
    .values({
      name: data.name,
      slug,
    })
    .returning();

  return tag;
}

export async function updateTag(id: string, data: { name?: string }) {
  const [existing] = await db
    .select()
    .from(tags)
    .where(eq(tags.id, id))
    .limit(1);

  if (!existing) {
    throw new HTTPException(404, { message: '标签不存在' });
  }

  const updateData: Record<string, unknown> = {};
  if (data.name) {
    updateData.name = data.name;
    updateData.slug = generateSlug(data.name);
  }

  const [updated] = await db
    .update(tags)
    .set(updateData)
    .where(eq(tags.id, id))
    .returning();

  return updated;
}

export async function deleteTag(id: string) {
  const [existing] = await db
    .select()
    .from(tags)
    .where(eq(tags.id, id))
    .limit(1);

  if (!existing) {
    throw new HTTPException(404, { message: '标签不存在' });
  }

  await db.delete(tags).where(eq(tags.id, id));
}
