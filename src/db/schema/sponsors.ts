import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const sponsors = pgTable('sponsors', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  alt: text('alt').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Sponsor = typeof sponsors.$inferSelect
export type NewSponsor = typeof sponsors.$inferInsert
