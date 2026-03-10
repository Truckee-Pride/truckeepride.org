import type { User } from '@/db/schema/users'

// Stub session for development — replace with real auth() in Phase 3.
// This returns a hardcoded admin user so all authenticated routes work locally.

const DEV_USER: User = {
  id: 'dev-user-id',
  name: 'Dev Admin',
  email: 'dev@truckeepride.org',
  emailVerified: null,
  image: null,
  role: 'admin',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}

export async function getCurrentUser(): Promise<User> {
  return DEV_USER
}
