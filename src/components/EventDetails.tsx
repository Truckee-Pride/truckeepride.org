import ReactMarkdown from 'react-markdown'
import { MARKDOWN_ALLOWED_ELEMENTS } from '@/lib/constants'
import Image from 'next/image'
import {
  Baby,
  Beer,
  Calendar,
  Dog,
  IdCard,
  MapPin,
  ShieldUser,
  Ticket,
} from 'lucide-react'
import type { Event } from '@/db/schema/events'

function formatDateRange(start: Date, end: Date | null) {
  const tz = 'America/Los_Angeles'
  const dateStr = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(start)

  const startTime = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
  }).format(start)

  if (!end) return `${dateStr} · ${startTime}`

  const endTime = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
  }).format(end)

  return `${dateStr} · ${startTime} – ${endTime}`
}

const AGE_ICONS: Record<string, typeof Baby> = {
  'All ages': Baby,
  'PG-13': ShieldUser,
  '21+': Beer,
  'Some parts 21+': Beer,
  '18+': IdCard,
}

type Props = {
  event: Event
}

export function EventDetails({ event }: Props) {
  const AgeIcon = AGE_ICONS[event.ageRestriction]

  return (
    <>
      {/* Info block */}
      <ul className="list-none p-0 m-0 space-y-1 text-base mt-6">
        <li className="flex items-center gap-2">
          <Calendar size={16} className="shrink-0" />
          {formatDateRange(event.startTime, event.endTime ?? null)}
        </li>
        <li className="flex items-start gap-2">
          <MapPin size={16} className="shrink-0 mt-[7px]" />
          <div>
            {event.locationName}
            {event.locationAddress && (
              <span className="text-muted"> · {event.locationAddress}</span>
            )}
          </div>
        </li>
        {event.requiresTicket && (
          <li className="flex items-center gap-2">
            <Ticket size={16} className="shrink-0" />
            {event.ticketUrl ? (
              <a href={event.ticketUrl} target="_blank" rel="noreferrer">
                Get tickets
              </a>
            ) : (
              'Requires tickets'
            )}
          </li>
        )}
        <li className="flex items-center gap-2">
          {AgeIcon && <AgeIcon size={16} className="shrink-0" />}
          {event.ageRestriction}
        </li>
        {event.dogsWelcome && (
          <li className="flex items-center gap-2">
            <Dog size={16} className="shrink-0" />
            Dogs welcome
          </li>
        )}
      </ul>

      {/* Description (markdown) */}
      <div className="prose mt-8">
        <ReactMarkdown allowedElements={[...MARKDOWN_ALLOWED_ELEMENTS]}>
          {event.description}
        </ReactMarkdown>
      </div>

      {/* Flyer image */}
      {event.flyerUrl && (
        <div className="mt-10">
          <Image
            src={event.flyerUrl}
            alt={`${event.title} flyer`}
            width={800}
            height={1100}
            style={{ width: '100%', height: 'auto' }}
            className="block max-w-sm"
          />
        </div>
      )}
    </>
  )
}
