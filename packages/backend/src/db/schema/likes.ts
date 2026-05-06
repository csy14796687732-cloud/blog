import { pgTable, uuid, timestamp, unique } from 'drizzle-orm/pg-core';
import { users } from './users';
import { posts } from './posts';

export const likes = pgTable(
  'likes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    post_id: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    created_at: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [unique().on(table.user_id, table.post_id)],
);
