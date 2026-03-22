import { db } from '@/lib/db'

export async function getSignupsEnabled(): Promise<boolean> {
  const row = await db.query.siteSettings.findFirst()
  return row?.signupsEnabled ?? true
}
