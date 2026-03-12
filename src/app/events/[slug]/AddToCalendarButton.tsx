'use client'

import { useEffect, useRef, useState } from 'react'
import { CalendarPlus } from 'lucide-react'

type Props = {
  title: string
  startTime: Date
  endTime: Date | null
  description: string
  locationName: string
  locationAddress: string | null
}

function toIcalDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function buildGoogleCalendarUrl(props: Props) {
  const start = toIcalDate(props.startTime)
  const end = props.endTime
    ? toIcalDate(props.endTime)
    : toIcalDate(props.startTime)
  const location = [props.locationName, props.locationAddress]
    .filter(Boolean)
    .join(', ')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: props.title,
    dates: `${start}/${end}`,
    details: props.description,
    location,
  })
  return `https://www.google.com/calendar/render?${params.toString()}`
}

function downloadIcs(props: Props) {
  const start = toIcalDate(props.startTime)
  const end = props.endTime
    ? toIcalDate(props.endTime)
    : toIcalDate(props.startTime)
  const location = [props.locationName, props.locationAddress]
    .filter(Boolean)
    .join(', ')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${props.title}`,
    `DESCRIPTION:${props.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

export function AddToCalendarButton(props: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const baseBtn =
    'inline-block px-6 py-3 rounded-lg font-semibold text-xl transition-all duration-300 ease-out cursor-pointer bg-brand text-inverse no-underline hover:bg-brand-hover hover:text-inverse hover:shadow-xl hover:-translate-y-1 uppercase'

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={baseBtn}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <CalendarPlus className="inline-block mr-2 -mt-0.5" size={20} />
        Add to Calendar
      </button>

      {open && (
        <div className="absolute left-0 mt-1 z-10 min-w-max rounded-lg border border-border bg-background shadow-lg py-1">
          <a
            href={buildGoogleCalendarUrl(props)}
            target="_blank"
            rel="noreferrer"
            className="block px-4 py-2 text-base text-foreground no-underline hover:bg-surface"
            onClick={() => setOpen(false)}
          >
            Google Calendar
          </a>
          <button
            className="block w-full text-left px-4 py-2 text-base text-foreground hover:bg-surface cursor-pointer"
            onClick={() => {
              downloadIcs(props)
              setOpen(false)
            }}
          >
            Download .ics
          </button>
        </div>
      )}
    </div>
  )
}
