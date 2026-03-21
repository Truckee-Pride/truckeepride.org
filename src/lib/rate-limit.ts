import { eq, and, inArray, count } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events } from '@/db/schema'

const TRUSTED_USER_LIMIT = 10
const NEW_USER_LIMIT = 3

export async function checkPendingEventLimit(userId: string): Promise<{
  allowed: boolean
  limit: number
  current: number
}> {
  const [[pendingCount], [approvedCount]] = await Promise.all([
    db
      .select({ value: count() })
      .from(events)
      .where(
        and(
          eq(events.ownerId, userId),
          inArray(events.status, ['draft', 'pending']),
        ),
      ),
    db
      .select({ value: count() })
      .from(events)
      .where(and(eq(events.ownerId, userId), eq(events.status, 'approved'))),
  ])

  const isTrusted = approvedCount.value > 0
  const limit = isTrusted ? TRUSTED_USER_LIMIT : NEW_USER_LIMIT
  const current = pendingCount.value

  return { allowed: current < limit, limit, current }
}
