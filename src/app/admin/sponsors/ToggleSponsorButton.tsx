'use client'

import { useTransition } from 'react'
import { TextButton } from '@/components/TextButton'
import { toggleSponsor } from './actions'

export function ToggleSponsorButton({
  id,
  enabled,
}: {
  id: number
  enabled: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await toggleSponsor(id, !enabled)
    })
  }

  return (
    <TextButton onClick={handleClick} disabled={isPending}>
      {isPending ? '…' : enabled ? 'Disable' : 'Enable'}
    </TextButton>
  )
}
