import { relations } from 'drizzle-orm'
import { events, eventOwners } from './events'
import { users } from './users'

export const eventsRelations = relations(events, ({ one, many }) => ({
  owner: one(users, {
    fields: [events.ownerId],
    references: [users.id],
  }),
  additionalOwners: many(eventOwners),
}))

export const eventOwnersRelations = relations(eventOwners, ({ one }) => ({
  event: one(events, {
    fields: [eventOwners.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventOwners.userId],
    references: [users.id],
  }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  additionalOwnerOf: many(eventOwners),
}))
