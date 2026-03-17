'use server'

import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth-stub'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { submitEventForReview } from '@/app/events/new/actions'

export async function confirmAndSubmit(
  eventId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireUser()

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })

  if (!event) return { success: false, error: 'Event not found' }
  if (event.ownerId !== user.id && user.role !== 'admin') {
    return {
      success: false,
      error: 'You do not have permission to submit this event',
    }
  }
  if (event.status !== 'draft') {
    redirect(`/events/${event.slug}`)
  }

  const result = await submitEventForReview(event.id, user.id)
  if (!result.success) return result

  redirect(`/events/${event.slug}`)
}
