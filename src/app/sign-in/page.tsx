import { redirect } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { getCurrentUser } from '@/lib/auth-stub'
import { cn } from '@/lib/utils'
import { LayoutWidth } from '@/lib/constants'
import { Input } from '@/components/forms/Input'
import { Button } from '@/components/Button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — Truckee Pride',
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const user = await getCurrentUser()
  if (user) {
    const { callbackUrl } = await searchParams
    redirect(callbackUrl ?? '/')
  }

  const { callbackUrl } = await searchParams

  async function handleSignIn(formData: FormData) {
    'use server'
    const email = formData.get('email') as string
    const redirectTo = formData.get('callbackUrl') as string
    await signIn('resend', {
      email,
      redirectTo: redirectTo || '/',
      redirect: false,
    })
    const params = new URLSearchParams({ email })
    if (redirectTo) params.set('callbackUrl', redirectTo)
    redirect(`/verify?${params}`)
  }

  return (
    <main className={cn(LayoutWidth.prose, 'py-12')}>
      <h1>Sign in to Truckee Pride</h1>
      <p className="text-subtle">
        Enter your email and we&apos;ll send you a magic link to sign in.
      </p>

      <form action={handleSignIn} className="space-y-4 max-w-sm">
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? ''} />
        <Input
          label="Email address"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          autoFocus
        />
        <Button type="submit">Send magic link</Button>
      </form>
    </main>
  )
}
