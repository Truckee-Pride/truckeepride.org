'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth-stub'
import { db } from '@/lib/db'
import { auditLog, users } from '@/db/schema'

export { banUser } from '../events/actions'

export async function unbanUser(id: string) {
  const admin = await requireUser()
  if (admin.role !== 'admin') return { success: false, error: 'Unauthorized' }

  await db.transaction(async (tx) => {
    await tx.update(users).set({ bannedAt: null }).where(eq(users.id, id))
    await tx.insert(auditLog).values({
      action: 'user_unbanned',
      userId: admin.id,
      targetType: 'user',
      targetId: id,
    })
  })

  revalidatePath('/admin/users')
  return { success: true }
}
