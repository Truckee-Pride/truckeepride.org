'use client'

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormField } from './FormField'
import { TextButton } from '@/components/TextButton'

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

function parse24h(hhMM: string) {
  const [hStr, mStr] = hhMM.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  const period: 'AM' | 'PM' = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return { h12, min: m, period }
}

function formatDuration(startHHMM: string, endHHMM: string): string | null {
  const [sh, sm] = startHHMM.split(':').map(Number)
  const [eh, em] = endHHMM.split(':').map(Number)
  const diff = eh * 60 + em - (sh * 60 + sm)
  if (diff <= 0) return null
  const h = Math.floor(diff / 60)
  const m = diff % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
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
  referenceTime?: string // HH:MM 24h — used to show duration in dropdown
  onChange?: (value: string) => void
  clearable?: boolean
}

export function TimeCombobox({
  label,
  name,
  required,
  defaultValue,
  errors,
  description,
  referenceTime,
  onChange,
  clearable,
}: Props) {
  const initial = defaultValue
    ? parse24h(defaultValue)
    : { h12: 12, min: 0, period: 'PM' as const }

  const [hour, setHour] = useState(initial.h12)
  const [minute, setMinute] = useState(initial.min)
  const [period, setPeriod] = useState<'AM' | 'PM'>(initial.period)
  const [open, setOpen] = useState(false)
  const [isEmpty, setIsEmpty] = useState(!defaultValue && !required)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const highlightedRef = useRef<HTMLLIElement>(null)
  const hourRef = useRef<HTMLInputElement>(null)
  const minuteRef = useRef<HTMLInputElement>(null)
  const periodRef = useRef<HTMLInputElement>(null)
  const clearRef = useRef<HTMLButtonElement>(null)
  const digitBuffer = useRef<number | null>(null)
  const digitTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const value24 = to24h(hour, minute, period)
  const hourText = String(hour).padStart(2, '0')
  const minuteText = String(minute).padStart(2, '0')
  const showClear = clearable && !isEmpty

  // --- Effects ---

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

  // Set highlighted index to current selection when dropdown opens
  useEffect(() => {
    if (open) {
      const idx = TIME_OPTIONS.findIndex((opt) => opt.value === value24)
      setHighlightedIndex(idx >= 0 ? idx : 0)
    }
  }, [open, value24])

  // Scroll highlighted item into view
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() =>
        highlightedRef.current?.scrollIntoView({ block: 'nearest' }),
      )
    }
  }, [open, highlightedIndex])

  // --- Handlers ---

  const handleSelect = useCallback(
    (opt: (typeof TIME_OPTIONS)[number]) => {
      setHour(opt.h12)
      setMinute(opt.min)
      setPeriod(opt.period as 'AM' | 'PM')
      setIsEmpty(false)
      setOpen(false)
      onChange?.(opt.value)
    },
    [onChange],
  )

  function clearBuffer() {
    digitBuffer.current = null
    clearTimeout(digitTimer.current)
  }

  function handleHourDigit(n: number) {
    if (digitBuffer.current !== null) {
      const full = digitBuffer.current * 10 + n
      setHour(
        full >= 1 && full <= 12 ? full : full === 0 ? 12 : digitBuffer.current,
      )
      clearBuffer()
      selectAll(hourRef.current)
      return
    }
    if (n >= 2) {
      setHour(n)
      clearBuffer()
      selectAll(hourRef.current)
      return
    }
    // 0 or 1: could be start of 01–12
    digitBuffer.current = n
    setHour(n === 0 ? 10 : n)
    selectAll(hourRef.current)
    digitTimer.current = setTimeout(() => {
      if (n === 0) setHour(10)
      digitBuffer.current = null
      selectAll(hourRef.current)
    }, 800)
  }

  function handleMinuteDigit(n: number) {
    if (digitBuffer.current !== null) {
      const full = digitBuffer.current * 10 + n
      setMinute(full <= 59 ? full : digitBuffer.current)
      clearBuffer()
      selectAll(minuteRef.current)
      return
    }
    if (n >= 6) {
      setMinute(n)
      clearBuffer()
      selectAll(minuteRef.current)
      return
    }
    digitBuffer.current = n
    setMinute(n)
    selectAll(minuteRef.current)
    digitTimer.current = setTimeout(() => {
      digitBuffer.current = null
      selectAll(minuteRef.current)
    }, 800)
  }

  function focusSegment(ref: React.RefObject<HTMLInputElement | null>) {
    clearBuffer()
    ref.current?.focus()
  }

  function handleSegmentFocus(ref: React.RefObject<HTMLInputElement | null>) {
    clearBuffer()
    selectAll(ref.current)
    setOpen(true)
  }

  function preventDeselect(
    e: React.MouseEvent,
    ref: React.RefObject<HTMLInputElement | null>,
  ) {
    e.preventDefault()
    selectAll(ref.current)
  }

  // Shared handler for dropdown list navigation — returns true if handled
  function handleDropdownKeys(e: KeyboardEvent): boolean {
    if (!open) return false
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((i) => (i < TIME_OPTIONS.length - 1 ? i + 1 : 0))
        return true
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((i) => (i > 0 ? i - 1 : TIME_OPTIONS.length - 1))
        return true
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0) handleSelect(TIME_OPTIONS[highlightedIndex])
        return true
      default:
        return false
    }
  }

  function handleHourKeyDown(e: KeyboardEvent) {
    if (handleDropdownKeys(e)) return
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        clearBuffer()
        setHour((h) => (h >= 12 ? 1 : h + 1))
        selectAll(hourRef.current)
        break
      case 'ArrowDown':
        e.preventDefault()
        clearBuffer()
        setHour((h) => (h <= 1 ? 12 : h - 1))
        selectAll(hourRef.current)
        break
      case 'ArrowRight':
        e.preventDefault()
        focusSegment(minuteRef)
        break
      case 'ArrowLeft':
        e.preventDefault()
        focusSegment(periodRef)
        break
      case 'Tab':
        setOpen(false)
        break
      default:
        e.preventDefault()
        if (/^[0-9]$/.test(e.key)) handleHourDigit(parseInt(e.key, 10))
    }
  }

  function handleMinuteKeyDown(e: KeyboardEvent) {
    if (handleDropdownKeys(e)) return
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        clearBuffer()
        setMinute((m) => (m >= 59 ? 0 : m + 1))
        selectAll(minuteRef.current)
        break
      case 'ArrowDown':
        e.preventDefault()
        clearBuffer()
        setMinute((m) => (m <= 0 ? 59 : m - 1))
        selectAll(minuteRef.current)
        break
      case 'ArrowRight':
        e.preventDefault()
        focusSegment(periodRef)
        break
      case 'ArrowLeft':
        e.preventDefault()
        focusSegment(hourRef)
        break
      case 'Tab':
        setOpen(false)
        break
      default:
        e.preventDefault()
        if (/^[0-9]$/.test(e.key)) handleMinuteDigit(parseInt(e.key, 10))
    }
  }

  function handlePeriodKeyDown(e: KeyboardEvent) {
    if (handleDropdownKeys(e)) return
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        e.preventDefault()
        setPeriod((p) => (p === 'AM' ? 'PM' : 'AM'))
        selectAll(periodRef.current)
        break
      case 'ArrowRight':
        e.preventDefault()
        focusSegment(hourRef)
        break
      case 'ArrowLeft':
        e.preventDefault()
        focusSegment(minuteRef)
        break
      case 'a':
      case 'A':
        e.preventDefault()
        setPeriod('AM')
        selectAll(periodRef.current)
        break
      case 'p':
      case 'P':
        e.preventDefault()
        setPeriod('PM')
        selectAll(periodRef.current)
        break
      case 'Tab':
        setOpen(false)
        break
      default:
        e.preventDefault()
    }
  }

  function handleClearEndTime() {
    setIsEmpty(true)
    setHour(12)
    setMinute(0)
    setPeriod('PM')
    setOpen(false)
    onChange?.('')
  }

  // --- Styles ---

  const segment =
    'bg-transparent text-base caret-transparent outline-none selection:bg-brand/20 text-foreground p-0'

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
            <input type="hidden" name={name} value={isEmpty ? '' : value24} />

            <div
              id={inputId}
              role="combobox"
              aria-label={label}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={`${inputId}-listbox`}
              aria-activedescendant={
                open && highlightedIndex >= 0
                  ? `${inputId}-option-${highlightedIndex}`
                  : undefined
              }
              aria-invalid={hasError || undefined}
              aria-describedby={describedBy}
              onClick={() => {
                if (isEmpty) setIsEmpty(false)
                setOpen(!open)
                hourRef.current?.focus()
              }}
              className={cn(
                'flex h-10 w-full cursor-pointer items-center rounded-md border border-border bg-background px-3',
                'text-base text-foreground',
                'has-focus:border-brand has-focus:ring-1 has-focus:ring-brand',
                hasError && 'border-error',
              )}
            >
              {isEmpty ? (
                <span className="text-base text-subtle select-none">
                  hh:mm PM
                </span>
              ) : (
                <div
                  className="flex items-center gap-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    ref={hourRef}
                    type="text"
                    inputMode="numeric"
                    value={hourText}
                    readOnly
                    aria-label="Hour"
                    onFocus={() => handleSegmentFocus(hourRef)}
                    onMouseUp={(e) => preventDeselect(e, hourRef)}
                    onKeyDown={handleHourKeyDown}
                    className={cn(segment, 'w-[2ch] text-right')}
                  />
                  <span
                    className="select-none text-base text-foreground"
                    aria-hidden
                  >
                    :
                  </span>
                  <input
                    ref={minuteRef}
                    type="text"
                    inputMode="numeric"
                    tabIndex={-1}
                    value={minuteText}
                    readOnly
                    aria-label="Minute"
                    onFocus={() => handleSegmentFocus(minuteRef)}
                    onMouseUp={(e) => preventDeselect(e, minuteRef)}
                    onKeyDown={handleMinuteKeyDown}
                    className={cn(segment, 'w-[2ch] text-left')}
                  />
                  <input
                    ref={periodRef}
                    type="text"
                    tabIndex={-1}
                    value={period}
                    readOnly
                    aria-label="AM or PM"
                    onFocus={() => handleSegmentFocus(periodRef)}
                    onMouseUp={(e) => preventDeselect(e, periodRef)}
                    onKeyDown={handlePeriodKeyDown}
                    className={cn(segment, 'ml-[0.5ch] w-[2.5ch] text-left')}
                  />
                </div>
              )}

              <ChevronDown aria-hidden className="ml-auto size-4 text-subtle" />
            </div>

            {open && (
              <ul
                id={`${inputId}-listbox`}
                role="listbox"
                aria-label={label}
                className="absolute top-full z-10 mt-1 max-h-60 w-full list-none overflow-y-auto rounded-xl border border-border bg-background p-1 shadow-lg"
              >
                {TIME_OPTIONS.map((opt, index) => {
                  const isSelected = opt.value === value24
                  const isHighlighted = index === highlightedIndex
                  const duration =
                    referenceTime && formatDuration(referenceTime, opt.value)
                  return (
                    <li
                      key={opt.value}
                      id={`${inputId}-option-${index}`}
                      ref={isHighlighted ? highlightedRef : undefined}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <button
                        type="button"
                        tabIndex={-1}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleSelect(opt)
                        }}
                        className={cn(
                          'flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-left text-base',
                          isSelected
                            ? 'bg-brand font-medium text-inverse'
                            : isHighlighted
                              ? 'bg-brand/20'
                              : 'hover:bg-surface',
                        )}
                      >
                        <span>{opt.label}</span>
                        {duration && (
                          <span
                            className={cn(
                              'text-sm',
                              isSelected ? 'text-inverse/70' : 'text-subtle',
                            )}
                          >
                            {duration}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            {showClear && (
              <TextButton
                ref={clearRef}
                type="button"
                intent="danger"
                onClick={handleClearEndTime}
                className="absolute -top-7 right-0"
              >
                Clear
              </TextButton>
            )}
          </div>
        )}
      </FormField>
    </div>
  )
}
