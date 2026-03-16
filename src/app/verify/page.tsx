import { signIn } from '@/lib/auth'
import { LayoutWidth } from '@/lib/constants'
import { Button } from '@/components/Button'

export const metadata = {
  title: 'Check Your Email — Truckee Pride',
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string
    event?: string
    callbackUrl?: string
  }>
}) {
  const { email, event, callbackUrl } = await searchParams

  async function handleResend(formData: FormData) {
    'use server'
    const resendEmail = formData.get('email') as string
    if (!resendEmail) return
    await signIn('resend', {
      email: resendEmail,
      redirectTo: callbackUrl || '/',
      redirect: false,
    })
  }

  return (
    <main className={`${LayoutWidth.prose} py-12`}>
      <h1 className="text-3xl font-bold mb-2">Check your email</h1>
      <p className="text-subtle mb-4">
        We sent a magic link to{' '}
        {email ? <strong>{email}</strong> : 'your email'}. Click the link in the
        email to sign in.
      </p>

      {event && (
        <p className="bg-yellow-50 border border-yellow-400 text-yellow-800 rounded-lg px-4 py-3 mb-4">
          Once you verify, you&apos;ll review your event before it goes live.
        </p>
      )}

      <p className="text-subtle mb-6">
        Didn&apos;t get it? Check your spam folder, or resend the link below.
      </p>

      {email && (
        <form action={handleResend}>
          <input type="hidden" name="email" value={email} />
          <Button type="submit">Resend magic link</Button>
        </form>
      )}
    </main>
  )
}
