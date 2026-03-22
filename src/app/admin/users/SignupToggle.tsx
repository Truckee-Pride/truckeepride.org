'use client'

import { useTransition } from 'react'
import { Button } from '@/components/Button'
import { Notice } from '@/components/Notice'
import { TextButton } from '@/components/TextButton'
import { toggleSignups } from './settings-actions'

export function SignupToggle({ enabled }: { enabled: boolean }) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      await toggleSignups(!enabled)
    })
  }

  if (!enabled) {
    return (
      <Notice intent="danger">
        <div className="flex items-center justify-between gap-4">
          <p className="m-0">New user sign-ups are currently disabled.</p>
          <Button
            intent="secondary"
            onClick={handleToggle}
            disabled={isPending}
          >
            {isPending ? 'Enabling...' : 'Enable Sign-ups'}
          </Button>
        </div>
      </Notice>
    )
  }

  return (
    <p className="mt-4 text-sm text-muted">
      New user sign-ups are enabled.{' '}
      <TextButton
        intent="danger"
        onClick={handleToggle}
        disabled={isPending}
      >
        {isPending ? 'Disabling...' : 'Disable Sign-ups'}
      </TextButton>
    </p>
  )
}
