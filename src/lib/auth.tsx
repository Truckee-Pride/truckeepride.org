import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth from 'next-auth'
import ResendProvider from 'next-auth/providers/resend'
import { render } from '@react-email/components'
import { MagicLinkEmail } from '@/emails/magic-link'
import { sendEmail, EMAIL_FROM } from './email'
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
  providers: [
    ResendProvider({
      from: EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendEmail({
          critical: true,
          from: EMAIL_FROM,
          to: identifier,
          subject: 'Sign in to Truckee Pride',
          html: await render(<MagicLinkEmail url={url} />),
        })
      },
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      session.user.role = (user as unknown as { role: 'user' | 'admin' }).role
      return session
    },
  },
})
