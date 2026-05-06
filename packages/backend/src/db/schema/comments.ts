import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { posts } from './posts';

export const commentStatusEnum = pgEnum('comment_status', [
  'pending',
  'approved',
  'rejected',
]);

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  status: commentStatusEnum('status').notNull().default('pending'),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  post_id: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  parent_id: uuid('parent_id').references(() => comments.id, {
    onDelete: 'cascade',
  }),
  created_at: timestamp('created_at').notNull().defaultNow(),
});
