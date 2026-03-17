'use client'

import { useRef, useState, useEffect, useId } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TextButton } from '@/components/TextButton'

type Option = { value: string; label: string }

type Props = {
  label: string
  options: Option[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
}

export function FilterSelect({
  label,
  options,
  value,
  onChange,
  multiple,
}: Props) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const id = useId()
  const listboxId = `${id}-listbox`

  const selectedSet = new Set(
    Array.isArray(value) ? value : value ? [value] : [],
  )
  const hasSelection = selectedSet.size > 0

  // All options for display: single-select gets an "All" option prepended
  const allOptions = multiple
    ? options
    : [{ value: '', label: 'All' }, ...options]

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return
    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setOpen(false)
    }
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  // Reset active index when opening
  useEffect(() => {
    if (open) setActiveIndex(0)
  }, [open])

  function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setOpen(true)
        setActiveIndex(0)
        break
      case 'ArrowUp':
        e.preventDefault()
        setOpen(true)
        setActiveIndex(allOptions.length - 1)
        break
      case 'Enter':
      case ' ':
        if (!open) {
          e.preventDefault()
          setOpen(true)
          setActiveIndex(0)
        }
        break
    }
  }

  function handleListKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, allOptions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case 'Home':
        e.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        e.preventDefault()
        setActiveIndex(allOptions.length - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (activeIndex >= 0) selectOption(allOptions[activeIndex].value)
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  function selectOption(optValue: string) {
    if (multiple) {
      const next = new Set(selectedSet)
      if (next.has(optValue)) {
        next.delete(optValue)
      } else {
        next.add(optValue)
      }
      onChange(Array.from(next))
    } else {
      onChange(optValue)
      setOpen(false)
    }
  }

  function handleClear() {
    onChange(multiple ? [] : '')
    setOpen(false)
  }

  // Trigger label
  let triggerText = label
  if (multiple && selectedSet.size > 0) {
    triggerText = `${label} (${selectedSet.size})`
  } else if (!multiple && hasSelection) {
    const selected = options.find((o) => o.value === value)
    if (selected) triggerText = `${label}: ${selected.label}`
  }

  const activeOptionId =
    activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open ? activeOptionId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={open ? handleListKeyDown : handleTriggerKeyDown}
        className={cn(
          'inline-flex min-h-[2.75rem] cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
          'hover:bg-surface',
          hasSelection ? 'font-semibold text-brand' : 'text-foreground',
        )}
      >
        {triggerText}
        <ChevronDown
          aria-hidden
          className={cn('size-4 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          aria-multiselectable={multiple || undefined}
          className="absolute left-0 z-10 mt-1 min-w-[180px] list-none rounded-xl border border-border bg-background p-1 shadow-lg"
        >
          {allOptions.map((opt, i) => {
            const isSelected = selectedSet.has(opt.value)
            const isActive = i === activeIndex
            return (
              <li
                key={opt.value}
                id={`${id}-option-${i}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  selectOption(opt.value)
                }}
                className={cn(
                  'flex min-h-[2.75rem] cursor-pointer items-center gap-2 rounded-lg px-3 text-sm',
                  isActive && 'bg-surface',
                  isSelected && 'font-semibold text-brand',
                )}
              >
                {multiple && (
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded border',
                      isSelected
                        ? 'border-brand bg-brand text-inverse'
                        : 'border-border bg-background',
                    )}
                  >
                    {isSelected && <Check className="size-3" />}
                  </span>
                )}
                {opt.label}
              </li>
            )
          })}
          {multiple && hasSelection && (
            <li
              role="presentation"
              className="border-t border-border px-3 pt-1.5 pb-1"
            >
              <TextButton type="button" intent="danger" onClick={handleClear}>
                Clear all
              </TextButton>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
