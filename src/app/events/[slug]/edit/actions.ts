'use server'

import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-stub'
import { db } from '@/lib/db'
import { events, auditLog } from '@/db/schema'
import { updateEventSchema, type UpdateEventInput } from '@/lib/schemas/events'
import { canEditEvent } from '@/lib/permissions'

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
  const user = await getCurrentUser()

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
    shortDescription: (formData.get('shortDescription') as string) || undefined,
    emoji: (formData.get('emoji') as string) || undefined,
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
  const startTime = new Date(`${data.date}T${data.startTime}`)
  const endTime = data.endTime ? new Date(`${data.date}T${data.endTime}`) : null

  const [updated] = await db
    .update(events)
    .set({
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

  redirect(`/events/${updated.slug}`)
}
