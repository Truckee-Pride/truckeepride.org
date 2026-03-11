'use server'

import { db } from '@/lib/db'
import { auditLog } from '@/db/schema'

export async function logAction(
  action: string,
  userId: string,
  targetType: string,
  targetId: string
) {
  await db.insert(auditLog).values({ action, userId, targetType, targetId })
}
