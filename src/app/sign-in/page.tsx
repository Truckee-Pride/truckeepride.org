import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-stub'
import { cn } from '@/lib/utils'
import { LayoutWidth } from '@/lib/constants'
import { SignInForm } from '@/components/forms/SignInForm'
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

  return (
    <main className={cn(LayoutWidth.prose)}>
      <h1>Sign in to Truckee Pride</h1>
      <SignInForm
        redirectTo={callbackUrl ?? '/'}
        autoFocus
        className="space-y-4 max-w-sm"
      />
    </main>
  )
}
