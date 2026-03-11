'use client'

import { useTransition } from 'react'
import { DashboardActionButton } from '@/components/dashboard/DashboardActionButton'
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
    <DashboardActionButton
      intent="danger"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? 'Deleting…' : 'Delete'}
    </DashboardActionButton>
  )
}
