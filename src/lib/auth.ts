import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'
import { db } from './db'
import { users, accounts, sessions, verificationTokens } from '@/db/schema'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: 'database' },
  providers: [Resend({ from: 'onboarding@resend.dev' })],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      session.user.role = (user as unknown as { role: 'user' | 'admin' }).role
      return session
    },
  },
})
