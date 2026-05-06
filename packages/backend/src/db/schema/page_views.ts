import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { posts } from './posts';

export const pageViews = pgTable('page_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  post_id: uuid('post_id').references(() => posts.id, { onDelete: 'set null' }),
  ip: varchar('ip', { length: 45 }),
  user_agent: text('user_agent'),
  path: varchar('path', { length: 500 }).notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
});
