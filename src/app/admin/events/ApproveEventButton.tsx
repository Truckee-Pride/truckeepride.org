'use client'

import { useTransition } from 'react'
import { TextButton } from '@/components/TextButton'
import { approveEvent } from './actions'

export function ApproveEventButton({
  id,
  title,
}: {
  id: string
  title: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!window.confirm(`Approve "${title}"?`)) return
    startTransition(async () => {
      await approveEvent(id)
    })
  }

  return (
    <TextButton intent="primary" onClick={handleClick} disabled={isPending}>
      {isPending ? 'Approving\u2026' : 'Approve'}
    </TextButton>
  )
}
