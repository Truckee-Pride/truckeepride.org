import { redirect } from 'next/navigation'
import { auth } from './auth'
import type { User } from '@/db/schema/users'

/** Returns the current user or null if unauthenticated. */
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return {
    id: session.user.id,
    name: session.user.name ?? null,
    firstName: session.user.name?.split(' ')[0] ?? null,
    lastName: session.user.name?.split(' ').slice(1).join(' ') ?? null,
    email: session.user.email!,
    emailVerified: null,
    image: session.user.image ?? null,
    phone: null,
    role:
      (session.user as unknown as { role: 'user' | 'admin' }).role ?? 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

/** Returns the current user or redirects to sign-in. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')
  return user
}
