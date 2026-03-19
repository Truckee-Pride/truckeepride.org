'use client'

import { useActionState, useState, useEffect, useRef } from 'react'
import { Input } from '@/components/forms/Input'
import { FormError } from '@/components/forms/FormError'
import { Button } from '@/components/Button'
import { Form } from '@/components/forms/Form'
import { TextButton } from '@/components/TextButton'
import { SignInForm } from '@/components/forms/SignInForm'
import {
  createAccountAndSignIn,
  sendSignInLink,
  type AccountActionState,
} from '@/app/events/new/actions'
import { accountFieldsSchema } from '@/lib/schemas/account'
import { useFormErrors } from '@/hooks/useFormErrors'

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
  const [sentEmail, setSentEmail] = useState<string | null>(null)
  const [verifyOriginMode, setVerifyOriginMode] = useState<'create' | 'signin'>(
    'create',
  )
  const [createState, createAction, isCreating] = useActionState(
    createAccountAndSignIn,
    initialState,
  )
  const [resendState, resendAction, isResending] = useActionState(
    sendSignInLink,
    initialState,
  )

  const { errors: createErrors, onFieldChange: onCreateChange } = useFormErrors(
    accountFieldsSchema.shape,
    createState.fieldErrors,
  )

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  // Phone formatting
  const [phoneDisplay, setPhoneDisplay] = useState('')
  const [phoneDigits, setPhoneDigits] = useState('')

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value.replace(/\D/g, '')
    // Strip leading US country code (+1) from autofill
    if (raw.length === 11 && raw.startsWith('1')) {
      raw = raw.slice(1)
    }
    raw = raw.slice(0, 10)
    setPhoneDigits(raw)
    setPhoneDisplay(formatPhone(raw))
    onCreateChange('phone', raw)
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

  useEffect(() => {
    if (createState.success && createState.email) {
      setSentEmail(createState.email)
      setVerifyOriginMode('create')
    }
  }, [createState.success, createState.email])

  function handleFirstNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFirstName(e.target.value)
    onCreateChange('firstName', e.target.value)
  }
  function handleLastNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLastName(e.target.value)
    onCreateChange('lastName', e.target.value)
  }
  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value)
    onCreateChange('email', e.target.value)
  }

  function handleToggleMode() {
    setMode(mode === 'create' ? 'signin' : 'create')
  }

  function handleTryAgain() {
    setSentEmail(null)
    setMode(verifyOriginMode)
  }

  function handleSignInEmailSent(email: string) {
    setSentEmail(email)
    setVerifyOriginMode('signin')
  }

  if (sentEmail) {
    return (
      <div className="mt-8 max-w-sm space-y-4">
        <p>
          We sent a login link to <strong>{sentEmail}</strong>. Click the link
          in your email to continue.
        </p>
        <p className="text-muted">
          <small>Didn&apos;t get it? Check your spam folder, or resend.</small>
        </p>
        <div className="flex gap-3 flex-wrap items-start">
          <Form action={resendAction} className="mt-0">
            <input type="hidden" name="email" value={sentEmail} />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <Button type="submit" disabled={isResending}>
              {isResending
                ? 'Sending...'
                : resendState.success
                  ? 'Sent!'
                  : 'Resend login link'}
            </Button>
          </Form>
          {verifyOriginMode === 'create' && (
            <Button intent="secondary" type="button" onClick={handleTryAgain}>
              Create Account
            </Button>
          )}
        </div>
        <p className={toggleSignInModeTextStyles}>
          Wrong email?{' '}
          <TextButton type="button" onClick={handleTryAgain}>
            Try again
          </TextButton>
        </p>
      </div>
    )
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
        <SignInForm
          redirectTo={redirectTo}
          className="space-y-4"
          onEmailSentAction={handleSignInEmailSent}
          defaultEmail={sentEmail ?? undefined}
        />
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
        <FormError message={createState.error} />

        <div className="grid gap-4 grid-cols-2">
          <Input
            label="First Name"
            name="firstName"
            required
            autoComplete="given-name"
            errors={createErrors.firstName}
            value={firstName}
            onChange={handleFirstNameChange}
          />
          <Input
            label="Last Name"
            name="lastName"
            required
            autoComplete="family-name"
            errors={createErrors.lastName}
            value={lastName}
            onChange={handleLastNameChange}
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
          errors={createErrors.email}
          value={email}
          onChange={handleEmailChange}
        />

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
          errors={createErrors.phone}
        />

        <Button type="submit" disabled={isCreating}>
          {isCreating ? 'Creating Account...' : 'Create Account'}
        </Button>
      </Form>
    </div>
  )
}
