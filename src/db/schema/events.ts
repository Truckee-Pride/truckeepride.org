import {
  boolean,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const eventStatusEnum = pgEnum('event_status', [
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'cancelled',
])

export const ageRestrictionEnum = pgEnum('age_restriction', [
  'All ages',
  '18+',
  '21+',
  'Some parts 21+',
  'PG-13',
])

export const events = pgTable('events', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  locationName: text('location_name').notNull(),
  locationAddress: text('location_address'),
  locationLat: real('location_lat'),
  locationLng: real('location_lng'),
  startTime: timestamp('start_time', { mode: 'date' }).notNull(),
  endTime: timestamp('end_time', { mode: 'date' }),
  flyerUrl: text('flyer_url'),
  ticketUrl: text('ticket_url'),
  shortDescription: text('short_description').notNull(),
  emoji: text('emoji').notNull(),
  requiresTicket: boolean('requires_ticket').default(false).notNull(),
  ageRestriction: ageRestrictionEnum('age_restriction')
    .default('All ages')
    .notNull(),
  vibeTags: text('vibe_tags').array().default([]).notNull(),
  dogsWelcome: boolean('dogs_welcome').default(false).notNull(),
  status: eventStatusEnum('status').default('draft').notNull(),
  rejectionReason: text('rejection_reason'),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const eventOwners = pgTable('event_owners', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  addedBy: text('added_by').references(() => users.id),
  addedAt: timestamp('added_at').defaultNow().notNull(),
})

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type EventOwner = typeof eventOwners.$inferSelect
