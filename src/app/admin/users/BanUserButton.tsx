'use client'

import { useTransition } from 'react'
import { TextButton } from '@/components/TextButton'
import { banUser, unbanUser } from './actions'

type Props = {
  id: string
  name: string | null
  isBanned: boolean
}

export function BanUserButton({ id, name, isBanned }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const label = name ?? 'this user'
    const message = isBanned
      ? `Unban ${label}?`
      : `Ban ${label}? They will not be able to submit events.`
    if (!window.confirm(message)) return

    startTransition(async () => {
      if (isBanned) {
        await unbanUser(id)
      } else {
        await banUser(id)
      }
    })
  }

  if (isBanned) {
    return (
      <TextButton onClick={handleClick} disabled={isPending}>
        {isPending ? 'Unbanning…' : 'Unban'}
      </TextButton>
    )
  }

  return (
    <TextButton intent="danger" onClick={handleClick} disabled={isPending}>
      {isPending ? 'Banning…' : 'Ban'}
    </TextButton>
  )
}
