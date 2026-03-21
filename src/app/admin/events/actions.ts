'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth-stub'
import { db } from '@/lib/db'
import { auditLog, events, users } from '@/db/schema'
import { sendEventApprovedEmail, sendEventRejectedEmail } from '@/lib/email'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://truckeepride.org'

async function getEventWithOwner(id: string) {
  const rows = await db
    .select({
      id: events.id,
      slug: events.slug,
      title: events.title,
      ownerEmail: users.email,
      ownerName: users.name,
    })
    .from(events)
    .innerJoin(users, eq(events.ownerId, users.id))
    .where(eq(events.id, id))
    .limit(1)
  return rows[0] ?? null
}

export async function approveEvent(id: string) {
  const user = await requireUser()
  if (user.role !== 'admin') return { success: false, error: 'Unauthorized' }

  const event = await getEventWithOwner(id)
  if (!event) return { success: false, error: 'Event not found' }

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

  await sendEventApprovedEmail({
    to: event.ownerEmail,
    ownerName: event.ownerName,
    eventTitle: event.title,
    eventUrl: `${BASE_URL}/events/${event.slug}`,
  })

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function rejectEvent(id: string, reason: string) {
  const user = await requireUser()
  if (user.role !== 'admin') return { success: false, error: 'Unauthorized' }

  const trimmed = reason.trim()
  if (!trimmed) return { success: false, error: 'Rejection reason is required' }

  const event = await getEventWithOwner(id)
  if (!event) return { success: false, error: 'Event not found' }

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

  await sendEventRejectedEmail({
    to: event.ownerEmail,
    ownerName: event.ownerName,
    eventTitle: event.title,
    editUrl: `${BASE_URL}/events/${event.id}/edit`,
    rejectionReason: trimmed,
  })

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function banUser(userId: string) {
  const user = await requireUser()
  if (user.role !== 'admin') return { success: false, error: 'Unauthorized' }
  if (userId === user.id) return { success: false, error: 'Cannot ban yourself' }

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ bannedAt: new Date() })
      .where(eq(users.id, userId))
    await tx.insert(auditLog).values({
      action: 'user_banned',
      userId: user.id,
      targetType: 'user',
      targetId: userId,
    })
  })

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteEvent(id: string) {
  const user = await requireUser()
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

  revalidatePath('/', 'layout')
  return { success: true }
}
