'use client'

import { useTransition } from 'react'
import { TextButton } from '@/components/TextButton'
import { rejectEvent } from './actions'

export function RejectEventButton({
  id,
  title,
}: {
  id: string
  title: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const reason = window.prompt(`Reason for rejecting "${title}"?`)
    if (reason === null) return
    if (!reason.trim()) {
      alert('A rejection reason is required.')
      return
    }
    startTransition(async () => {
      await rejectEvent(id, reason)
    })
  }

  return (
    <TextButton intent="danger" onClick={handleClick} disabled={isPending}>
      {isPending ? 'Rejecting\u2026' : 'Reject'}
    </TextButton>
  )
}
