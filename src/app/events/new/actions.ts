'use server'

import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-stub'
import { db } from '@/lib/db'
import { events, auditLog } from '@/db/schema'
import { createEventSchema, type CreateEventInput } from '@/lib/schemas/events'
import { generateSlug, ensureUniqueSlug } from '@/lib/slug'
import { isBlobUrl } from '@/lib/upload'
import { checkPendingEventLimit } from '@/lib/rate-limit'

export type CreateEventState = {
  success: boolean
  error?: string
  fieldErrors?: Partial<Record<keyof CreateEventInput, string[]>>
}

export async function createEvent(
  _prev: CreateEventState,
  formData: FormData,
): Promise<CreateEventState> {
  const user = await getCurrentUser()

  const rateLimit = await checkPendingEventLimit(user.id)
  if (!rateLimit.allowed) {
    return {
      success: false,
      error:
        'You have too many pending events. Please wait for existing submissions to be reviewed.',
    }
  }

  const raw = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    locationName: formData.get('locationName') as string,
    locationAddress: (formData.get('locationAddress') as string) || undefined,
    date: formData.get('date') as string,
    startTime: formData.get('startTime') as string,
    endTime: (formData.get('endTime') as string) || undefined,
    flyerUrl: (formData.get('flyerUrl') as string) || undefined,
    ticketUrl: (formData.get('ticketUrl') as string) || undefined,
    shortDescription: (formData.get('shortDescription') as string) || undefined,
    emoji: (formData.get('emoji') as string) || undefined,
    requiresTicket: formData.get('requiresTicket') === 'on',
    ageRestriction: formData.get('ageRestriction') as string,
    dogsWelcome: formData.get('dogsWelcome') === 'on',
  }

  const result = createEventSchema.safeParse(raw)
  if (!result.success) {
    return {
      success: false,
      fieldErrors: result.error.flatten().fieldErrors as Partial<
        Record<keyof CreateEventInput, string[]>
      >,
    }
  }

  const data = result.data

  // Validate flyerUrl is either empty or a blob URL
  if (data.flyerUrl && !isBlobUrl(data.flyerUrl)) {
    return {
      success: false,
      fieldErrors: { flyerUrl: ['Invalid image URL'] } as Partial<
        Record<keyof CreateEventInput, string[]>
      >,
    }
  }

  const baseSlug = generateSlug(data.title)
  const slug = await ensureUniqueSlug(baseSlug)

  const startTime = new Date(`${data.date}T${data.startTime}`)
  const endTime = data.endTime
    ? new Date(`${data.date}T${data.endTime}`)
    : undefined

  const [event] = await db
    .insert(events)
    .values({
      slug,
      title: data.title,
      description: data.description,
      locationName: data.locationName,
      locationAddress: data.locationAddress ?? null,
      startTime,
      endTime,
      flyerUrl: data.flyerUrl || null,
      ticketUrl: data.ticketUrl || null,
      shortDescription: data.shortDescription,
      emoji: data.emoji,
      requiresTicket: data.requiresTicket,
      ageRestriction: data.ageRestriction,
      dogsWelcome: data.dogsWelcome,
      status: 'draft',
      ownerId: user.id,
    })
    .returning({ id: events.id, slug: events.slug })

  await db.insert(auditLog).values({
    action: 'create',
    userId: user.id,
    targetType: 'event',
    targetId: event.id,
  })

  await submitEventForReview(event.id, user.id)

  redirect(`/events/${event.slug}`)
}

// Transitions a draft event to pending_review. Called after createEvent and
// can be called standalone when a user re-submits an existing draft.
export async function submitEventForReview(
  eventId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const [updated] = await db
    .update(events)
    .set({ status: 'pending_review', updatedAt: new Date() })
    .where(eq(events.id, eventId))
    .returning({ id: events.id })

  if (!updated) {
    return { success: false, error: 'Failed to submit event for review' }
  }

  await db.insert(auditLog).values({
    action: 'submit_for_review',
    userId,
    targetType: 'event',
    targetId: eventId,
  })

  return { success: true }
}
