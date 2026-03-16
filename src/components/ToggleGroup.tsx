'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'

type Option = { value: string; label: string }

type Props = {
  label: string
  options: Option[]
  value: string
  onChange: (value: string) => void
}

export function ToggleGroup({ label, options, value, onChange }: Props) {
  const groupRef = useRef<HTMLDivElement>(null)

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let next: number | null = null

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        next = (index + 1) % options.length
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        next = (index - 1 + options.length) % options.length
        break
      case ' ':
        e.preventDefault()
        onChange(options[index].value)
        return
      default:
        return
    }

    if (next !== null) {
      onChange(options[next].value)
      const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>(
        'button[role="radio"]',
      )
      buttons?.[next]?.focus()
    }
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-lg border border-border bg-surface"
    >
      {options.map((opt, i) => {
        const isActive = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={cn(
              'min-h-[2.75rem] cursor-pointer px-4 text-sm font-medium transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
              i === 0 && 'rounded-l-lg',
              i === options.length - 1 && 'rounded-r-lg',
              isActive
                ? 'bg-brand text-inverse'
                : 'bg-surface text-foreground hover:bg-background',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
