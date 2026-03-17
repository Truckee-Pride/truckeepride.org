'use client'

import { useActionState, useState, useEffect } from 'react'
import { TextButton } from '@/components/TextButton'
import { Input } from '@/components/forms/Input'
import { Button } from '@/components/Button'
import { Form } from '@/components/forms/Form'
import { FormError } from '@/components/forms/FormError'
import { useFormErrors } from '@/hooks/useFormErrors'
import { accountFieldsSchema } from '@/lib/schemas/account'
import {
  sendSignInLink,
  type AccountActionState,
} from '@/app/events/new/actions'

const initialState: AccountActionState = { success: false }

type Props = {
  redirectTo?: string
  autoFocus?: boolean
  className?: string
  defaultEmail?: string
  // When provided, parent handles the verify UI instead of this component
  onEmailSentAction?: (email: string) => void
}

export function SignInForm({
  redirectTo = '/',
  autoFocus,
  className,
  defaultEmail,
  onEmailSentAction,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    sendSignInLink,
    initialState,
  )
  const [resendState, resendAction, isResending] = useActionState(
    sendSignInLink,
    initialState,
  )
  const [showVerify, setShowVerify] = useState(false)
  const [editableEmail, setEditableEmail] = useState(defaultEmail ?? '')
  const { errors, onFieldChange } = useFormErrors(
    { email: accountFieldsSchema.shape.email },
    state.fieldErrors,
  )

  useEffect(() => {
    if (state.success && state.email) {
      if (onEmailSentAction) {
        onEmailSentAction(state.email)
      } else {
        setShowVerify(true)
      }
    }
  }, [state.success, state.email, onEmailSentAction])

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFieldChange('email', e.target.value)
    setEditableEmail(e.target.value)
  }

  function handleTryAgain() {
    setShowVerify(false)
  }

  const sentEmail = state.email

  if (showVerify && sentEmail) {
    return (
      <div className={className}>
        <p>
          We sent a login link to <strong>{sentEmail}</strong>. Click the link
          in your email to sign in.
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
        </div>
        <p className="text-sm text-muted">
          Wrong email?{' '}
          <TextButton type="button" onClick={handleTryAgain}>
            Try again
          </TextButton>
        </p>
      </div>
    )
  }

  return (
    <Form action={formAction} autoComplete="on" className={className}>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <FormError message={state.error} />
      <Input
        label="Email address"
        name="email"
        type="email"
        required
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        errors={errors.email}
        autoFocus={autoFocus}
        value={editableEmail}
        onChange={handleEmailChange}
      />
      <p className="text-subtle text-sm">
        If you have an account, we&apos;ll send a login link to your email.
      </p>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Sending...' : 'Send login link'}
      </Button>
    </Form>
  )
}
