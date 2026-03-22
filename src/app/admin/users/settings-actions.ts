'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth-stub'
import { db } from '@/lib/db'
import { siteSettings } from '@/db/schema'

export async function toggleSignups(enabled: boolean) {
  const user = await requireUser()
  if (user.role !== 'admin') return { success: false, error: 'Unauthorized' }

  const existing = await db.query.siteSettings.findFirst()
  if (existing) {
    await db
      .update(siteSettings)
      .set({ signupsEnabled: enabled })
      .where(eq(siteSettings.id, existing.id))
  } else {
    await db.insert(siteSettings).values({ signupsEnabled: enabled })
  }

  revalidatePath('/admin/users')
  revalidatePath('/events/new')
  return { success: true }
}
