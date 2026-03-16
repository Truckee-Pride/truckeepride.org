'use client'

import { useRef, useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { FormField } from './FormField'

const segmentBase = cn(
  'bg-transparent text-center text-base text-foreground font-mono tabular-nums',
  'focus:outline-none',
  'selection:bg-brand/20',
)

type Props = {
  label: string
  name: string
  required?: boolean
  errors?: string[]
  description?: string
  defaultValue?: string // YYYY-MM-DD
  onChangeAction?: (value: string) => void
}

function currentYear() {
  return new Date().getFullYear()
}

export function DateInput({
  label,
  name,
  required,
  errors,
  description,
  defaultValue,
  onChangeAction,
}: Props) {
  const [month, setMonth] = useState(() =>
    defaultValue ? defaultValue.slice(5, 7) : '',
  )
  const [day, setDay] = useState(() =>
    defaultValue ? defaultValue.slice(8, 10) : '',
  )
  const [year, setYear] = useState(() =>
    defaultValue ? defaultValue.slice(0, 4) : '',
  )
  const [open, setOpen] = useState(false)
  const [displayedMonth, setDisplayedMonth] = useState<Date>(() => {
    if (defaultValue) return new Date(defaultValue + 'T00:00:00')
    return new Date()
  })

  // Track last valid values for revert-on-blur
  const lastValid = useRef(
    defaultValue
      ? {
          month: defaultValue.slice(5, 7),
          day: defaultValue.slice(8, 10),
          year: defaultValue.slice(0, 4),
        }
      : { month: '', day: '', year: '' },
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const monthRef = useRef<HTMLInputElement>(null)
  const dayRef = useRef<HTMLInputElement>(null)
  const yearRef = useRef<HTMLInputElement>(null)

  const thisYear = currentYear()
  const nextYear = thisYear + 1

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const oneYearFromToday = new Date(today)
  oneYearFromToday.setFullYear(oneYearFromToday.getFullYear() + 1)

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setOpen(false)
    }
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function isValidDate(
    m = parseInt(month, 10),
    d = parseInt(day, 10),
    y = parseInt(year, 10),
  ): boolean {
    if (!m || !d || !y) return false
    if (m < 1 || m > 12) return false
    if (d < 1 || d > 31) return false
    if (y !== thisYear && y !== nextYear) return false
    // Check the date actually exists (e.g. no Feb 30)
    const date = new Date(y, m - 1, d)
    if (
      date.getFullYear() !== y ||
      date.getMonth() !== m - 1 ||
      date.getDate() !== d
    )
      return false
    // Must be between today and one year from today
    if (date < today || date > oneYearFromToday) return false
    return true
  }

  // Save valid state whenever segments form a valid date
  if (isValidDate()) {
    lastValid.current = { month, day, year }
  }

  function revertIfInvalid() {
    if (!month && !day && !year) return // allow fully empty
    // Year is still being typed — don't revert yet
    if (year.length > 0 && year.length < 4) return
    if (!isValidDate()) {
      setMonth(lastValid.current.month)
      setDay(lastValid.current.day)
      setYear(lastValid.current.year)
    }
  }

  const parsedDate = isValidDate()
    ? new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10))
    : undefined

  const hiddenValue = isValidDate()
    ? `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    : ''

  const isMountedRef = useRef(false)
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true
      return
    }
    onChangeAction?.(hiddenValue)
  }, [hiddenValue]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync calendar displayed month when typed segments form a valid month/year
  useEffect(() => {
    const m = parseInt(month, 10)
    const y = parseInt(year, 10)
    if (m >= 1 && m <= 12 && (y === thisYear || y === nextYear)) {
      setDisplayedMonth(new Date(y, m - 1))
    }
  }, [month, year, thisYear, nextYear])

  function handleDaySelect(selected: Date | undefined) {
    if (!selected) return
    setMonth(String(selected.getMonth() + 1).padStart(2, '0'))
    setDay(String(selected.getDate()).padStart(2, '0'))
    setYear(String(selected.getFullYear()))
    setOpen(false)
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    maxLength: number,
    nextRef?: React.RefObject<HTMLInputElement | null>,
  ) {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Commit current state as valid if it passes validation
      if (isValidDate()) {
        lastValid.current = { month, day, year }
      }
      setOpen(false)
      return
    }

    // Allow navigation keys
    if (
      ['Tab', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)
    ) {
      return
    }

    // Block non-numeric keys
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault()
      return
    }

    // Auto-advance to next field when full
    const input = e.currentTarget
    const selStart = input.selectionStart ?? 0
    const selEnd = input.selectionEnd ?? 0
    const hasSelection = selEnd - selStart > 0
    const wouldBeFull = !hasSelection && input.value.length >= maxLength

    if (wouldBeFull && nextRef?.current) {
      e.preventDefault()
      const setter =
        nextRef === dayRef ? setDay : nextRef === yearRef ? setYear : setMonth
      setter(e.key)
      nextRef.current.focus()
      requestAnimationFrame(() => {
        nextRef.current?.setSelectionRange(1, 1)
      })
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void,
  ) {
    const cleaned = e.target.value.replace(/\D/g, '')
    setter(cleaned)
  }

  const hasError = errors != null && errors.length > 0

  const calendarStart = new Date(today.getFullYear(), today.getMonth())
  const calendarEnd = new Date(
    oneYearFromToday.getFullYear(),
    oneYearFromToday.getMonth(),
  )
  const disabledDates = [{ before: today }, { after: oneYearFromToday }]

  return (
    <div
      ref={containerRef}
      onBlur={(e) => {
        // Close calendar when focus leaves the entire container
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          setOpen(false)
        }
      }}
    >
      <FormField
        label={label}
        name={name}
        required={required}
        description={description}
        errors={errors}
      >
        {({ inputId, hasError: fieldHasError, describedBy }) => (
          <div className="relative">
            <input type="hidden" name={name} value={hiddenValue} />
            <div
              className={cn(
                'flex h-10 w-full cursor-pointer items-center rounded-md border border-border bg-background px-3',
                'focus-within:border-brand focus-within:ring-1 focus-within:ring-brand',
                fieldHasError && 'border-error',
              )}
              onClick={(e) => {
                if (!(e.target as HTMLElement).closest('input, button')) {
                  setOpen(true)
                  yearRef.current?.focus()
                }
              }}
            >
              <input
                ref={monthRef}
                id={inputId}
                type="text"
                inputMode="numeric"
                aria-label="Month"
                aria-invalid={hasError || undefined}
                aria-describedby={describedBy}
                placeholder="MM"
                maxLength={2}
                value={month}
                className={cn(segmentBase, 'w-[2ch]')}
                onKeyDown={(e) => handleKeyDown(e, 2, dayRef)}
                onChange={(e) => handleChange(e, setMonth)}
                onBlur={revertIfInvalid}
                onFocus={(e) => {
                  e.target.select()
                  setOpen(true)
                }}
              />
              <span className="mx-[0.25ch] text-muted">/</span>
              <input
                ref={dayRef}
                type="text"
                inputMode="numeric"
                aria-label="Day"
                placeholder="DD"
                maxLength={2}
                value={day}
                className={cn(segmentBase, 'w-[2ch]')}
                onKeyDown={(e) => handleKeyDown(e, 2, yearRef)}
                onChange={(e) => handleChange(e, setDay)}
                onBlur={revertIfInvalid}
                onFocus={(e) => {
                  e.target.select()
                  setOpen(true)
                }}
              />
              <span className="mx-[0.25ch] text-muted">/</span>
              <input
                ref={yearRef}
                type="text"
                inputMode="numeric"
                aria-label="Year"
                placeholder="YYYY"
                maxLength={4}
                value={year}
                className={cn(segmentBase, 'w-[4ch]')}
                onKeyDown={(e) => handleKeyDown(e, 4)}
                onChange={(e) => handleChange(e, setYear)}
                onBlur={revertIfInvalid}
                onFocus={(e) => {
                  e.target.select()
                  setOpen(true)
                }}
              />
              <button
                type="button"
                aria-label="Open calendar"
                onClick={() => setOpen((o) => !o)}
                className="ml-auto cursor-pointer text-subtle hover:text-muted"
              >
                <Calendar aria-hidden className="size-4" />
              </button>
            </div>

            {open && (
              <div className="absolute top-full z-10 mt-1 rounded-xl border border-border bg-background p-2 shadow-lg">
                <DayPicker
                  mode="single"
                  selected={parsedDate}
                  onSelect={handleDaySelect}
                  month={displayedMonth}
                  onMonthChange={setDisplayedMonth}
                  startMonth={calendarStart}
                  endMonth={calendarEnd}
                  disabled={disabledDates}
                  classNames={{
                    months: 'flex',
                    month_caption:
                      'flex justify-center items-center h-8 font-medium text-base text-foreground',
                    nav: 'flex items-center justify-between absolute inset-x-0 top-0 h-8 px-1',
                    button_previous: cn(
                      'inline-flex size-8 items-center justify-center rounded-lg',
                      'cursor-pointer text-muted hover:bg-surface hover:text-foreground',
                    ),
                    button_next: cn(
                      'inline-flex size-8 items-center justify-center rounded-lg',
                      'cursor-pointer text-muted hover:bg-surface hover:text-foreground',
                    ),
                    month_grid: 'mt-1 border-collapse',
                    weekdays: 'flex',
                    weekday: 'w-9 text-center text-sm font-medium text-muted',
                    week: 'flex',
                    day: 'p-0 text-center',
                    day_button: cn(
                      'inline-flex size-9 items-center justify-center rounded-lg',
                      'cursor-pointer text-sm text-foreground tabular-nums',
                      'hover:bg-surface',
                    ),
                    selected: 'bg-brand/20 text-foreground rounded-lg',
                    today: 'font-bold',
                    outside: 'text-muted opacity-50',
                    disabled:
                      'text-muted opacity-30 cursor-default hover:bg-transparent',
                    caption_label: 'text-base font-medium',
                    root: 'relative',
                  }}
                />
              </div>
            )}
          </div>
        )}
      </FormField>
    </div>
  )
}
