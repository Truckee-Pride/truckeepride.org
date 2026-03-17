import { signIn } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { LayoutWidth } from '@/lib/constants'
import { Notice } from '@/components/Notice'
import { Button } from '@/components/Button'
import { Form } from '@/components/forms/Form'
import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Check Your Email — Truckee Pride',
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string
    event?: string
    callbackUrl?: string
    next?: string
  }>
}) {
  const { email, event, callbackUrl, next } = await searchParams
  const redirectTo = next || callbackUrl || '/'

  async function handleResend(formData: FormData) {
    'use server'
    const resendEmail = formData.get('email') as string
    const resendRedirectTo = formData.get('redirectTo') as string
    if (!resendEmail) return
    await signIn('resend', {
      email: resendEmail,
      redirectTo: resendRedirectTo || '/',
      redirect: false,
    })
  }

  return (
    <main className={cn(LayoutWidth.prose, 'py-12')}>
      <PageHeader title="Check your email" />
      <p>
        If an account exists for{' '}
        {email ? <strong>{email}</strong> : 'your email'}, we sent a login link.
        Click the link in the email to sign in.
      </p>

      {event && (
        <Notice>
          Once you verify, you&apos;ll review your event before it goes live.
        </Notice>
      )}

      <p className="text-muted">
        <small>
          Didn&apos;t get it? Check your spam folder, or resend the link below.
        </small>
      </p>

      {email && (
        <div className="flex gap-3 flex-wrap">
          <Form action={handleResend}>
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <Button type="submit">Resend login link</Button>
          </Form>
          <Button intent="secondary" href="/events/new">
            Create Account
          </Button>
        </div>
      )}
    </main>
  )
}
