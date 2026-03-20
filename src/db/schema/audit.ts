import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const auditLog = pgTable('audit_log', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  action: text('action').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  targetType: text('target_type'),
  targetId: text('target_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type AuditLog = typeof auditLog.$inferSelect
export type NewAuditLog = typeof auditLog.$inferInsert
