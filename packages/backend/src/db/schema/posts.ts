import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { categories } from './categories';

export const postStatusEnum = pgEnum('post_status', ['draft', 'published']);

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  excerpt: varchar('excerpt', { length: 500 }),
  content: text('content').notNull(),
  cover_image: varchar('cover_image', { length: 500 }),
  status: postStatusEnum('status').notNull().default('draft'),
  featured: boolean('featured').notNull().default(false),
  view_count: integer('view_count').notNull().default(0),
  author_id: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  category_id: uuid('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  published_at: timestamp('published_at'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});
