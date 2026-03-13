'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { FormField } from './FormField'

// 48 options: 12:00 AM → 11:30 PM in 30-min increments
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h24 = Math.floor((i * 30) / 60)
  const min = (i * 30) % 60
  const value = `${String(h24).padStart(2, '0')}:${String(min).padStart(2, '0')}`
  const period = h24 < 12 ? 'AM' : 'PM'
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24
  const label = `${String(h12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${period}`
  return { value, label, h12, min, period }
})

function to24h(h12: number, min: number, period: 'AM' | 'PM'): string {
  let h24 = h12
  if (period === 'AM' && h12 === 12) h24 = 0
  else if (period === 'PM' && h12 !== 12) h24 = h12 + 12
  return `${String(h24).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

function parse24h(hhMM: string): {
  h12: number
  min: number
  period: 'AM' | 'PM'
} {
  const [hStr, mStr] = hhMM.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  const period: 'AM' | 'PM' = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return { h12, min: m, period }
}

function selectAll(el: HTMLInputElement | null) {
  if (!el) return
  requestAnimationFrame(() => el.select())
}

type Props = {
  label: string
  name: string
  required?: boolean
  defaultValue?: string // HH:MM 24h
  errors?: string[]
  description?: string
}

export function TimeCombobox({
  label,
  name,
  required,
  defaultValue,
  errors,
  description,
}: Props) {
  const initial = defaultValue
    ? parse24h(defaultValue)
    : { h12: 12, min: 0, period: 'PM' as const }

  const [hour, setHour] = useState(initial.h12)
  const [minute, setMinute] = useState(initial.min)
  const [period, setPeriod] = useState<'AM' | 'PM'>(initial.period)
  const [open, setOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLLIElement>(null)
  const hourRef = useRef<HTMLInputElement>(null)
  const minuteRef = useRef<HTMLInputElement>(null)
  const periodRef = useRef<HTMLInputElement>(null)

  // Digit buffer for two-keystroke number entry
  const digitBuffer = useRef<number | null>(null)
  const digitTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const value24 = to24h(hour, minute, period)
  const hourText = String(hour).padStart(2, '0')
  const minuteText = String(minute).padStart(2, '0')

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  // Scroll selected option into view when dropdown opens
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        selectedRef.current?.scrollIntoView({ block: 'nearest' })
      })
    }
  }, [open])

  const handleSelect = useCallback((opt: (typeof TIME_OPTIONS)[number]) => {
    setHour(opt.h12)
    setMinute(opt.min)
    setPeriod(opt.period as 'AM' | 'PM')
    setOpen(false)
  }, [])

  function clearBuffer() {
    digitBuffer.current = null
    clearTimeout(digitTimer.current)
  }

  function handleHourDigit(n: number) {
    if (digitBuffer.current !== null) {
      // Second digit — combine
      const full = digitBuffer.current * 10 + n
      const clamped =
        full >= 1 && full <= 12 ? full : full === 0 ? 12 : digitBuffer.current
      setHour(clamped)
      clearBuffer()
      selectAll(hourRef.current)
    } else {
      // First digit
      if (n >= 2) {
        // Can only be single digit (2–9)
        setHour(n)
        clearBuffer()
        selectAll(hourRef.current)
      } else {
        // 0 or 1 — could be start of 01–12, wait for second digit
        digitBuffer.current = n
        // Show the digit immediately as a preview
        setHour(n === 0 ? 10 : n) // 0→show 10 temporarily, 1→show 1
        selectAll(hourRef.current)
        digitTimer.current = setTimeout(() => {
          // No second digit came — accept as-is
          if (n === 0) setHour(10)
          digitBuffer.current = null
          selectAll(hourRef.current)
        }, 800)
      }
    }
  }

  function handleMinuteDigit(n: number) {
    if (digitBuffer.current !== null) {
      const full = digitBuffer.current * 10 + n
      setMinute(full <= 59 ? full : digitBuffer.current)
      clearBuffer()
      selectAll(minuteRef.current)
    } else {
      if (n >= 6) {
        setMinute(n)
        clearBuffer()
        selectAll(minuteRef.current)
      } else {
        digitBuffer.current = n
        setMinute(n)
        selectAll(minuteRef.current)
        digitTimer.current = setTimeout(() => {
          digitBuffer.current = null
          selectAll(minuteRef.current)
        }, 800)
      }
    }
  }

  const segmentBase =
    'bg-transparent text-center text-base caret-transparent outline-none selection:bg-brand/20 text-foreground rounded-sm'

  return (
    <div ref={containerRef}>
      <FormField
        label={label}
        name={name}
        required={required}
        description={description}
        errors={errors}
      >
        {({ inputId, hasError, describedBy }) => (
          <div className="relative">
            <input type="hidden" name={name} value={value24} />

            <div
              id={inputId}
              role="group"
              aria-label={label}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-invalid={hasError || undefined}
              aria-describedby={describedBy}
              onClick={() => {
                setOpen(!open)
                hourRef.current?.focus()
              }}
              className={cn(
                'flex h-10 w-full cursor-pointer items-center rounded-md border border-border bg-background px-3',
                'text-base text-foreground',
                'has-[:focus]:border-brand has-[:focus]:ring-1 has-[:focus]:ring-brand',
                hasError && 'border-error',
              )}
            >
              <div
                className="flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Hour */}
                <input
                  ref={hourRef}
                  type="text"
                  inputMode="numeric"
                  value={hourText}
                  readOnly
                  aria-label="Hour"
                  onFocus={() => {
                    clearBuffer()
                    selectAll(hourRef.current)
                    setOpen(true)
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault()
                    selectAll(hourRef.current)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      clearBuffer()
                      setHour((h) => (h >= 12 ? 1 : h + 1))
                      selectAll(hourRef.current)
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      clearBuffer()
                      setHour((h) => (h <= 1 ? 12 : h - 1))
                      selectAll(hourRef.current)
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault()
                      clearBuffer()
                      minuteRef.current?.focus()
                    } else if (e.key === 'ArrowLeft') {
                      e.preventDefault()
                      clearBuffer()
                      periodRef.current?.focus()
                    } else if (/^[0-9]$/.test(e.key)) {
                      e.preventDefault()
                      handleHourDigit(parseInt(e.key, 10))
                    } else if (e.key !== 'Tab') {
                      e.preventDefault()
                    }
                  }}
                  className={cn(segmentBase, 'w-6')}
                />

                {/* Colon — use an input-like span with matching line-height */}
                <span className="inline-flex w-2 select-none justify-center text-base text-foreground">
                  :
                </span>

                {/* Minute */}
                <input
                  ref={minuteRef}
                  type="text"
                  inputMode="numeric"
                  value={minuteText}
                  readOnly
                  aria-label="Minute"
                  onFocus={() => {
                    clearBuffer()
                    selectAll(minuteRef.current)
                    setOpen(true)
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault()
                    selectAll(minuteRef.current)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      clearBuffer()
                      setMinute((m) => (m >= 59 ? 0 : m + 1))
                      selectAll(minuteRef.current)
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      clearBuffer()
                      setMinute((m) => (m <= 0 ? 59 : m - 1))
                      selectAll(minuteRef.current)
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault()
                      clearBuffer()
                      periodRef.current?.focus()
                    } else if (e.key === 'ArrowLeft') {
                      e.preventDefault()
                      clearBuffer()
                      hourRef.current?.focus()
                    } else if (/^[0-9]$/.test(e.key)) {
                      e.preventDefault()
                      handleMinuteDigit(parseInt(e.key, 10))
                    } else if (e.key !== 'Tab') {
                      e.preventDefault()
                    }
                  }}
                  className={cn(segmentBase, 'w-6')}
                />

                {/* AM/PM */}
                <input
                  ref={periodRef}
                  type="text"
                  value={period}
                  readOnly
                  aria-label="AM or PM"
                  onFocus={() => {
                    clearBuffer()
                    selectAll(periodRef.current)
                    setOpen(true)
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault()
                    selectAll(periodRef.current)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                      e.preventDefault()
                      setPeriod((p) => (p === 'AM' ? 'PM' : 'AM'))
                      selectAll(periodRef.current)
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault()
                      hourRef.current?.focus()
                    } else if (e.key === 'ArrowLeft') {
                      e.preventDefault()
                      minuteRef.current?.focus()
                    } else if (e.key === 'a' || e.key === 'A') {
                      e.preventDefault()
                      setPeriod('AM')
                      selectAll(periodRef.current)
                    } else if (e.key === 'p' || e.key === 'P') {
                      e.preventDefault()
                      setPeriod('PM')
                      selectAll(periodRef.current)
                    } else if (e.key !== 'Tab') {
                      e.preventDefault()
                    }
                  }}
                  className={cn(segmentBase, 'ml-1 w-7')}
                />
              </div>

              <span aria-hidden className="ml-auto text-sm text-subtle">
                ▾
              </span>
            </div>

            {open && (
              <ul
                role="listbox"
                aria-label={label}
                className="absolute top-full z-10 mt-1 max-h-60 w-full list-none overflow-y-auto rounded-xl border border-border bg-background p-1 shadow-lg"
              >
                {TIME_OPTIONS.map((opt) => {
                  const isSelected = opt.value === value24
                  return (
                    <li
                      key={opt.value}
                      ref={isSelected ? selectedRef : undefined}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleSelect(opt)
                        }}
                        className={cn(
                          'w-full cursor-pointer rounded-lg px-3 py-1.5 text-left text-base',
                          isSelected
                            ? 'bg-brand font-medium text-inverse'
                            : 'hover:bg-surface',
                        )}
                      >
                        {opt.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </FormField>
    </div>
  )
}
