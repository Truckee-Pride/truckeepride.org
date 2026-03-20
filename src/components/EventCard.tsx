import Link from 'next/link'
import Image from 'next/image'
import { Clock, MapPin } from 'lucide-react'
import type { Event } from '@/db/schema/events'

// Pastel 6-stripe rainbow pride flag colors
const PRIDE_COLORS = [
  '#fca5a5', // red
  '#fdba74', // orange
  '#fde047', // yellow
  '#86efac', // green
  '#93c5fd', // blue
  '#c4b5fd', // violet
]

function formatCardTime(start: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: '2-digit',
  }).format(start)
}

type Props = {
  event: Event
  colorIndex: number
}

export function EventCard({ event, colorIndex }: Props) {
  const borderColor = PRIDE_COLORS[colorIndex % PRIDE_COLORS.length]

  return (
    <Link href={`/events/${event.slug}`} className="group block no-underline">
      <div
        className="flex h-[15rem] overflow-hidden rounded-xl border border-border border-l-[5px] bg-background transition-all duration-200 ease-out group-hover:-translate-y-0.5 group-hover:shadow-lg"
        style={{ borderLeftColor: borderColor }}
      >
        {/* Text */}
        <div className="flex flex-1 flex-col justify-start gap-1.5 px-4 pt-8 pb-[1.875rem]">
          {event.emoji && (
            <div className="text-2xl leading-none">{event.emoji}</div>
          )}
          <h3 className="m-0 text-xl md:text-3xl font-bold leading-snug text-foreground group-hover:underline decoration-1 underline-offset-2">
            {event.title}
          </h3>
          <p className="m-0 flex items-center gap-1.5 text-sm text-muted">
            <Clock size={13} className="shrink-0" />
            {formatCardTime(event.startTime)}
          </p>
          <p className="m-0 flex items-center gap-1.5 text-sm text-muted">
            <MapPin size={13} className="shrink-0" />
            {event.locationName}
          </p>
          {event.shortDescription && (
            <p className="m-0 mt-1 text-base text-foreground line-clamp-1">
              {event.shortDescription}
            </p>
          )}
        </div>

        {/* Flyer — natural width from aspect ratio, capped at square */}
        {event.flyerUrl && (
          <div className="shrink-0 self-stretch flex items-center pt-2 pb-2 pr-2">
            <Image
              src={event.flyerUrl}
              alt={`${event.title} flyer`}
              width={240}
              height={240}
              style={{
                width: '14rem',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'right center',
              }}
              sizes="240px"
            />
          </div>
        )}
      </div>
    </Link>
  )
}
