import { type InferSelectModel } from 'drizzle-orm'
import { users } from '@/db/schema'

export type User = InferSelectModel<typeof users>

export function computeName(
  firstName: string | null,
  lastName: string | null,
): string | null {
  const parts = [firstName, lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : null
}

export const formatPhoneNumber = (user: User) =>
  user.phone?.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') ?? ''
