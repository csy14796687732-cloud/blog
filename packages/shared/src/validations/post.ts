import { z } from 'zod';

export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(200, '标题最多200个字符'),
  content: z.string().min(1, '内容不能为空'),
  excerpt: z.string().max(500).optional(),
  cover_image: z.string().max(500).optional(),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  featured: z.boolean().optional().default(false),
  category_id: z.string().uuid().optional().nullable(),
  tags: z.array(z.string().uuid()).optional(),
});

export const updatePostSchema = createPostSchema.partial();

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, '分类名称不能为空')
    .max(50, '分类名称最多50个字符'),
  description: z.string().max(200).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, '标签名称不能为空')
    .max(50, '标签名称最多50个字符'),
});

export const updateTagSchema = createTagSchema.partial();

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, '评论内容不能为空')
    .max(2000, '评论最多2000个字符'),
  parent_id: z.string().uuid().optional().nullable(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
