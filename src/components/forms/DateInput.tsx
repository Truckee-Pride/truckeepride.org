'use client'

import { useRef, useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { FormField } from './FormField'
import { shortDate } from '@/lib/dateTimeFormatters'

function parseDefaultValue(value: string | undefined): Date | undefined {
  if (!value) return undefined
  const date = new Date(value + 'T00:00:00')
  return isNaN(date.getTime()) ? undefined : date
}

function toHiddenValue(date: Date | undefined): string {
  if (!date) return ''
  const y = String(date.getFullYear()).padStart(4, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

type Props = {
  label: string
  name: string
  required?: boolean
  errors?: string[]
  description?: string
  defaultValue?: string // YYYY-MM-DD
  onChangeAction?: (value: string) => void
}

const PLACEHOLDER = 'Sat, Jun 7'
const DEFAULT_CALENDAR_MONTH = new Date(2026, 5) // June 2026

export function DateInput({
  label,
  name,
  required,
  errors,
  description,
  defaultValue,
  onChangeAction,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() =>
    parseDefaultValue(defaultValue),
  )
  const [open, setOpen] = useState(false)
  const [displayedMonth, setDisplayedMonth] = useState<Date>(() => {
    if (defaultValue) {
      const parsed = parseDefaultValue(defaultValue)
      if (parsed) return new Date(parsed.getFullYear(), parsed.getMonth())
    }
    return DEFAULT_CALENDAR_MONTH
  })

  const containerRef = useRef<HTMLDivElement>(null)

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

  const hiddenValue = toHiddenValue(selectedDate)

  const isMountedRef = useRef(false)
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true
      return
    }
    onChangeAction?.(hiddenValue)
  }, [hiddenValue]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleDaySelect(selected: Date | undefined) {
    if (!selected) return
    setSelectedDate(selected)
    setOpen(false)
  }

  function handleButtonClick() {
    setOpen((o) => !o)
  }

  const dateButtonStyles = cn(
    'flex h-10 w-full cursor-pointer items-center rounded-md border border-border bg-background px-3',
    'focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none',
  )

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
            <button
              id={inputId}
              type="button"
              aria-label="Open calendar"
              aria-describedby={describedBy}
              onClick={handleButtonClick}
              className={cn(dateButtonStyles, fieldHasError && 'border-error')}
            >
              <span className={selectedDate ? 'text-foreground' : 'text-muted'}>
                {selectedDate ? shortDate(selectedDate) : PLACEHOLDER}
              </span>
              <Calendar aria-hidden className="ml-auto size-4 text-subtle" />
            </button>

            {open && (
              <div className="absolute top-full z-10 mt-1 rounded-xl border border-border bg-background p-2 shadow-lg">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
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
                    weekdays: '',
                    weekday: 'w-9 text-center text-sm font-medium text-muted',
                    week: '',
                    day: 'p-0 text-center',
                    day_button: cn(
                      'inline-flex size-9 items-center justify-center rounded-lg',
                      'cursor-pointer text-sm text-foreground',
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
