import ReactMarkdown from 'react-markdown'
import { MARKDOWN_ALLOWED_ELEMENTS, SAFE_LINK_PROTOCOLS } from '@/lib/constants'
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
  /** HTML heading level for the event title. Defaults to 'h2'. */
  headingLevel?: 'h1' | 'h2'
  /** A component to display on the right side of the title. */
  accessory?: React.ReactNode
}

export function EventDetails({
  event,
  headingLevel = 'h2',
  accessory,
}: Props) {
  const AgeIcon = AGE_ICONS[event.ageRestriction]
  const Heading = headingLevel

  return (
    <>
      {/* Title block */}
      <header>
        {event.emoji && (
          <div className="text-5xl leading-none mb-2">{event.emoji}</div>
        )}
        {accessory ? (
          <div className="flex flex-wrap gap-1 items-center justify-between">
            <Heading className="mt-0 mb-0">{event.title}</Heading>
            <div className="mt-2">{accessory}</div>
          </div>
        ) : (
          <Heading className="mt-0 mb-0">{event.title}</Heading>
        )}
        {event.shortDescription && (
          <p className="text-muted mt-1 mb-0">{event.shortDescription}</p>
        )}
      </header>

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
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
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
        <ReactMarkdown
          allowedElements={[...MARKDOWN_ALLOWED_ELEMENTS]}
          components={{
            a: ({ href, children }) => {
              const safe = href && SAFE_LINK_PROTOCOLS.test(href)
              if (!safe) return <>{children}</>
              return (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              )
            },
          }}
        >
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
