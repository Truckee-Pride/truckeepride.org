import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth from 'next-auth'
import ResendProvider from 'next-auth/providers/resend'
import { render } from '@react-email/components'
import { Resend } from 'resend'
import { MagicLinkEmail } from '@/emails/magic-link'
import { db } from './db'
import { users, accounts, sessions, verificationTokens } from '@/db/schema'

const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

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
        await resend.emails.send({
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
