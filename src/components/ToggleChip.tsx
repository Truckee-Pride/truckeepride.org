'use client'

import { cn } from '@/lib/utils'

type Props = {
  label: string
  pressed: boolean
  onChangeAction: (pressed: boolean) => void
  children: React.ReactNode
}

const baseStyles =
  'min-h-[2.75rem] rounded-lg border border-border px-3 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

export function ToggleChip({
  label,
  pressed,
  onChangeAction,
  children,
}: Props) {
  function handleClick() {
    onChangeAction(!pressed)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      aria-label={label}
      className={cn(
        baseStyles,
        pressed ? 'bg-brand text-inverse' : 'bg-background hover:bg-surface',
      )}
      onClick={handleClick}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  )
}
