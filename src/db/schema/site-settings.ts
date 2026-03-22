import { boolean, pgTable, serial } from 'drizzle-orm/pg-core'

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  signupsEnabled: boolean('signups_enabled').notNull().default(true),
})

export type SiteSettings = typeof siteSettings.$inferSelect
