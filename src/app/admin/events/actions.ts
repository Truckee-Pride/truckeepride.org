'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth-stub'
import { db } from '@/lib/db'
import { auditLog, events } from '@/db/schema'

export async function deleteEvent(id: string) {
  const user = await getCurrentUser()
  if (user.role !== 'admin') return { success: false, error: 'Unauthorized' }

  await db.transaction(async (tx) => {
    await tx.delete(events).where(eq(events.id, id))
    await tx
      .insert(auditLog)
      .values({
        action: 'delete',
        userId: user.id,
        targetType: 'event',
        targetId: id,
      })
  })

  revalidatePath('/admin/events')
  return { success: true }
}
