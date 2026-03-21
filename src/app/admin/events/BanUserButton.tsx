'use client'

import { useTransition } from 'react'
import { TextButton } from '@/components/TextButton'
import { banUser } from './actions'

export function BanUserButton({ ownerId }: { ownerId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (
      !window.confirm(
        'Ban this user? They will no longer be able to submit events.',
      )
    )
      return
    startTransition(async () => {
      await banUser(ownerId)
    })
  }

  return (
    <TextButton intent="danger" onClick={handleClick} disabled={isPending}>
      {isPending ? 'Banning…' : 'Ban'}
    </TextButton>
  )
}
