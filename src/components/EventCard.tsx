import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
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

function formatCardDate(start: Date, end: Date | null): string {
  const tz = 'America/Los_Angeles'
  const timeFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
  })
  const date = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(start)
  const startTime = timeFmt.format(start)
  if (!end) return `${date} · ${startTime}`
  const endTime = timeFmt.format(end)
  return `${date} · ${startTime} – ${endTime}`
}

type Props = {
  event: Event
  colorIndex: number
}

const cardClasses = cn(
  'flex h-[15rem] overflow-hidden rounded-xl border-2 bg-background',
  'transition-all duration-200 ease-out group-hover:-translate-y-0.5 group-hover:shadow-lg',
)

export function EventCard({ event, colorIndex }: Props) {
  const borderColor = PRIDE_COLORS[colorIndex % PRIDE_COLORS.length]

  return (
    <Link href={`/events/${event.slug}`} className="group block no-underline">
      <div className={cardClasses} style={{ borderColor: borderColor }}>
        {/* Text */}
        <div className="flex flex-1 flex-col justify-start gap-1.5 px-4 pt-8 pb-[1.875rem]">
          {event.emoji && (
            <div className="text-2xl leading-none">{event.emoji}</div>
          )}
          <h3 className="text-foreground m-0 text-xl leading-snug font-bold decoration-1 underline-offset-2 group-hover:underline md:text-3xl">
            {event.title}
          </h3>
          <p className="text-muted m-0 flex items-center gap-1.5 text-sm">
            <Calendar size={13} className="shrink-0" />
            {formatCardDate(event.startTime, event.endTime ?? null)}
          </p>
          <p className="text-muted m-0 flex items-center gap-1.5 text-sm">
            <MapPin size={13} className="shrink-0" />
            {event.locationName}
          </p>
          {event.shortDescription && (
            <p className="text-foreground m-0 mt-1 line-clamp-1 text-base">
              {event.shortDescription}
            </p>
          )}
        </div>

        {/* Flyer — natural width from aspect ratio, capped at square */}
        {event.flyerUrl && (
          <div className="flex shrink-0 items-center self-stretch pt-2 pr-2 pb-2">
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
