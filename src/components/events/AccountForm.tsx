'use client'

import { useActionState, useState, useEffect, useRef } from 'react'
import { Input } from '@/components/forms/Input'
import { FormError } from '@/components/forms/FormError'
import { Button } from '@/components/Button'
import { Form } from '@/components/forms/Form'
import { TextButton } from '@/components/TextButton'
import {
  createAccountAndSignIn,
  sendSignInLink,
  type AccountActionState,
} from '@/app/events/new/actions'

const initialState: AccountActionState = { success: false }

const toggleSignInModeTextStyles = 'text-muted text-sm'

type Props = {
  redirectTo: string
}

function formatPhone(digits: string): string {
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

export function AccountForm({ redirectTo }: Props) {
  const [mode, setMode] = useState<'create' | 'signin'>('create')
  const [createState, createAction, isCreating] = useActionState(
    createAccountAndSignIn,
    initialState,
  )
  const [signInState, signInAction, isSigningIn] = useActionState(
    sendSignInLink,
    initialState,
  )

  const state = mode === 'create' ? createState : signInState
  const isPending = mode === 'create' ? isCreating : isSigningIn

  // Phone formatting
  const [phoneDisplay, setPhoneDisplay] = useState('')
  const [phoneDigits, setPhoneDigits] = useState('')

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhoneDigits(raw)
    setPhoneDisplay(formatPhone(raw))
  }

  // Gravatar preview
  const [email, setEmail] = useState('')
  const [gravatarUrl, setGravatarUrl] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    if (!email || !email.includes('@')) {
      setGravatarUrl(null)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/gravatar?email=${encodeURIComponent(email)}`,
        )
        if (res.ok) {
          const data = await res.json()
          setGravatarUrl(data.url)
        } else {
          setGravatarUrl(null)
        }
      } catch {
        setGravatarUrl(null)
      }
    }, 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [email])

  function handleToggleMode() {
    setMode(mode === 'create' ? 'signin' : 'create')
  }

  if (mode === 'signin') {
    return (
      <div className="mt-8 max-w-sm">
        <p className={toggleSignInModeTextStyles}>
          New here?{' '}
          <TextButton type="button" onClick={handleToggleMode}>
            Create Account
          </TextButton>
        </p>

        <Form action={signInAction} autoComplete="on" className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <FormError message={state.error} />

          <Input
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            errors={state.fieldErrors?.email}
          />

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Sending...' : 'Send Login Link'}
          </Button>
        </Form>
      </div>
    )
  }

  return (
    <div className="mt-8 max-w-sm">
      <p className={toggleSignInModeTextStyles}>
        Already have an account?{' '}
        <TextButton type="button" onClick={handleToggleMode}>
          Sign In
        </TextButton>
      </p>

      <Form action={createAction} autoComplete="on" className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input type="hidden" name="phone" value={phoneDigits} />
        <input type="hidden" name="gravatarUrl" value={gravatarUrl ?? ''} />
        <FormError message={state.error} />

        <div className="grid gap-4 grid-cols-2">
          <Input
            label="First Name"
            name="firstName"
            required
            autoComplete="given-name"
            errors={state.fieldErrors?.firstName}
          />
          <Input
            label="Last Name"
            name="lastName"
            required
            autoComplete="family-name"
            errors={state.fieldErrors?.lastName}
          />
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          errors={state.fieldErrors?.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {gravatarUrl && (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gravatarUrl}
              alt="Your Gravatar"
              className="w-12 h-12 rounded-full"
            />
            <span className="text-sm text-muted">We found your Gravatar!</span>
          </div>
        )}

        <Input
          label="Phone Number"
          name="phoneDisplay"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder="(555) 555-1234"
          value={phoneDisplay}
          onChange={handlePhoneChange}
          errors={state.fieldErrors?.phone}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating Account...' : 'Create Account'}
        </Button>
      </Form>
    </div>
  )
}
