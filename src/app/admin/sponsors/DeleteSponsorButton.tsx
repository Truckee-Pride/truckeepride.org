'use client'

import { useTransition } from 'react'
import { TextButton } from '@/components/TextButton'
import { deleteSponsor } from './actions'

export function DeleteSponsorButton({
  id,
  name,
}: {
  id: number
  name: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (
      !window.confirm(`Remove "${name}" as a sponsor? This cannot be undone.`)
    )
      return
    startTransition(async () => {
      await deleteSponsor(id)
    })
  }

  return (
    <TextButton intent="danger" onClick={handleClick} disabled={isPending}>
      {isPending ? 'Removing…' : 'Remove'}
    </TextButton>
  )
}
