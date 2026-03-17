'use client'

import { useTransition } from 'react'
import { Button } from '@/components/Button'
import { confirmAndSubmit } from './actions'

type Props = {
  eventId: string
}

export function ConfirmSubmitButton({ eventId }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(() => {
      confirmAndSubmit(eventId)
    })
  }

  return (
    <Button type="button" onClick={handleClick} disabled={isPending}>
      {isPending ? 'Submitting...' : 'Submit for Review'}
    </Button>
  )
}
