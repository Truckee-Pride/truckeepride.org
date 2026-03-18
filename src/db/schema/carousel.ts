import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const carouselPhotos = pgTable('carousel_photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  src: text('src').notNull(),
  alt: text('alt').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})
