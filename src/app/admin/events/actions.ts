'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth-stub'
import { db } from '@/lib/db'
import { auditLog, events } from '@/db/schema'

export async function approveEvent(id: string) {
  const user = await getCurrentUser()
  if (user.role !== 'admin') return { success: false, error: 'Unauthorized' }

  await db.transaction(async (tx) => {
    await tx
      .update(events)
      .set({ status: 'approved', rejectionReason: null })
      .where(eq(events.id, id))
    await tx.insert(auditLog).values({
      action: 'event_approved',
      userId: user.id,
      targetType: 'event',
      targetId: id,
    })
  })

  revalidatePath('/admin/events')
  return { success: true }
}

export async function rejectEvent(id: string, reason: string) {
  const user = await getCurrentUser()
  if (user.role !== 'admin') return { success: false, error: 'Unauthorized' }

  const trimmed = reason.trim()
  if (!trimmed) return { success: false, error: 'Rejection reason is required' }

  await db.transaction(async (tx) => {
    await tx
      .update(events)
      .set({ status: 'rejected', rejectionReason: trimmed })
      .where(eq(events.id, id))
    await tx.insert(auditLog).values({
      action: 'event_rejected',
      userId: user.id,
      targetType: 'event',
      targetId: id,
    })
  })

  revalidatePath('/admin/events')
  return { success: true }
}

export async function deleteEvent(id: string) {
  const user = await getCurrentUser()
  if (user.role !== 'admin') return { success: false, error: 'Unauthorized' }

  await db.transaction(async (tx) => {
    await tx.delete(events).where(eq(events.id, id))
    await tx.insert(auditLog).values({
      action: 'delete',
      userId: user.id,
      targetType: 'event',
      targetId: id,
    })
  })

  revalidatePath('/admin/events')
  return { success: true }
}
