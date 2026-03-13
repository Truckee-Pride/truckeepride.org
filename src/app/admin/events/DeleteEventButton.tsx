'use client'

import { useTransition } from 'react'
import { TextButton } from '@/components/TextButton'
import { deleteEvent } from './actions'

export function DeleteEventButton({
  id,
  title,
}: {
  id: string
  title: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    startTransition(async () => {
      await deleteEvent(id)
    })
  }

  return (
    <TextButton intent="danger" onClick={handleClick} disabled={isPending}>
      {isPending ? 'Deleting…' : 'Delete'}
    </TextButton>
  )
}
