'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'

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

  return (
    <div ref={ref} className="relative inline-block">
      <Button
        icon="calendar-plus"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        Add to Calendar
      </Button>

      {open && (
        <div className="border-border bg-background absolute left-0 z-10 mt-1 min-w-max rounded-lg border py-1 shadow-lg">
          <a
            href={buildGoogleCalendarUrl(props)}
            target="_blank"
            rel="noreferrer"
            className="text-foreground hover:bg-surface block px-4 py-2 text-base no-underline"
            onClick={() => setOpen(false)}
          >
            Google Calendar
          </a>
          <button
            className="text-foreground hover:bg-surface block w-full cursor-pointer px-4 py-2 text-left text-base"
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
