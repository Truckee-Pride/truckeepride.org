import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { eventOwners } from '@/db/schema'
import type { User } from '@/db/schema/users'
import type { Event } from '@/db/schema/events'

export async function canEditEvent(user: User, event: Event): Promise<boolean> {
  if (user.role === 'admin') return true
  if (event.ownerId === user.id) return true

  const additionalOwner = await db.query.eventOwners.findFirst({
    where: and(
      eq(eventOwners.eventId, event.id),
      eq(eventOwners.userId, user.id),
    ),
  })
  return additionalOwner != null
}
