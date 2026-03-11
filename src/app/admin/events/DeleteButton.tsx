'use client'

import { useTransition } from 'react'
import { deleteEvent } from './actions'

export function DeleteButton({ id, title }: { id: string; title: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    startTransition(async () => {
      await deleteEvent(id)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="cursor-pointer text-red-600 hover:underline disabled:cursor-default disabled:opacity-50"
    >
      {isPending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
