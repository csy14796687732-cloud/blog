import { pgTable, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { posts } from './posts';
import { tags } from './tags';

export const postTags = pgTable(
  'post_tags',
  {
    post_id: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    tag_id: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.post_id, table.tag_id] })],
);
