'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth-stub'
import { db } from '@/lib/db'
import { events, auditLog } from '@/db/schema'
import { updateEventSchema, type UpdateEventInput } from '@/lib/schemas/events'
import { del } from '@vercel/blob'
import { canEditEvent } from '@/lib/permissions'
import { isBlobUrl } from '@/lib/upload'
import { pacificToDate } from '@/lib/timezone'

export type UpdateEventState = {
  success: boolean
  error?: string
  fieldErrors?: Partial<Record<keyof UpdateEventInput, string[]>>
}

export async function updateEvent(
  eventId: string,
  _prev: UpdateEventState,
  formData: FormData,
): Promise<UpdateEventState> {
  const user = await requireUser()

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })

  if (!event) return { success: false, error: 'Event not found' }

  if (!(await canEditEvent(user, event))) {
    return {
      success: false,
      error: 'You do not have permission to edit this event',
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
    shortDescription: formData.get('shortDescription') as string,
    emoji: formData.get('emoji') as string,
    vibeTags: formData.getAll('vibeTags') as string[],
    requiresTicket: formData.get('requiresTicket') === 'on',
    ageRestriction: formData.get('ageRestriction') as string,
    dogsWelcome: formData.get('dogsWelcome') === 'on',
  }

  const result = updateEventSchema.safeParse(raw)
  if (!result.success) {
    return {
      success: false,
      fieldErrors: result.error.flatten().fieldErrors as Partial<
        Record<keyof UpdateEventInput, string[]>
      >,
    }
  }

  const data = result.data

  // Validate flyerUrl: must be empty, a blob URL, or the unchanged existing URL
  if (
    data.flyerUrl &&
    !isBlobUrl(data.flyerUrl) &&
    data.flyerUrl !== event.flyerUrl
  ) {
    return {
      success: false,
      fieldErrors: { flyerUrl: ['Invalid image URL'] } as Partial<
        Record<keyof UpdateEventInput, string[]>
      >,
    }
  }

  // Delete old blob if flyer was replaced or removed
  const oldFlyerUrl = event.flyerUrl
  const newFlyerUrl = data.flyerUrl ?? null
  if (oldFlyerUrl && isBlobUrl(oldFlyerUrl) && oldFlyerUrl !== newFlyerUrl) {
    try {
      await del(oldFlyerUrl)
    } catch {
      // Non-critical — old blob will be cleaned up eventually
    }
  }

  const startTime = pacificToDate(data.date, data.startTime)
  const endTime = data.endTime ? pacificToDate(data.date, data.endTime) : null

  const [updated] = await db
    .update(events)
    .set({
      title: data.title,
      description: data.description,
      locationName: data.locationName,
      locationAddress: data.locationAddress ?? null,
      startTime,
      endTime,
      flyerUrl: data.flyerUrl ?? null,
      ticketUrl: data.ticketUrl ?? null,
      shortDescription: data.shortDescription,
      emoji: data.emoji,
      vibeTags: data.vibeTags,
      requiresTicket: data.requiresTicket,
      ageRestriction: data.ageRestriction,
      dogsWelcome: data.dogsWelcome,
      updatedAt: new Date(),
    })
    .where(eq(events.id, eventId))
    .returning({ slug: events.slug })

  await db.insert(auditLog).values({
    action: 'update',
    userId: user.id,
    targetType: 'event',
    targetId: eventId,
  })

  revalidatePath('/', 'layout')
  redirect(`/events/${updated.slug}`)
}
