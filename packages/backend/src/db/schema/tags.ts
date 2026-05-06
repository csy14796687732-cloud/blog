import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  created_at: timestamp('created_at').notNull().defaultNow(),
});
