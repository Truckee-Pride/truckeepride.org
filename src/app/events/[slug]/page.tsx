import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
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
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { FlyerImage } from './FlyerImage'
import { AddToCalendarButton } from './AddToCalendarButton'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await db.query.events.findFirst({
    where: eq(events.slug, slug),
  })
  if (!event || !['approved', 'cancelled'].includes(event.status)) return {}
  return {
    title: event.title,
    description: event.shortDescription ?? event.description.slice(0, 160),
    openGraph: event.flyerUrl ? { images: [event.flyerUrl] } : undefined,
  }
}

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

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await db.query.events.findFirst({
    where: eq(events.slug, slug),
  })

  if (!event) notFound()
  if (!['approved', 'cancelled'].includes(event.status)) notFound()

  const cancelled = event.status === 'cancelled'

  return (
    <main>
      {cancelled && (
        <div className="bg-red-100 border border-red-400 text-red-800 rounded-lg px-4 py-3 mb-6 font-semibold">
          This event has been cancelled.
        </div>
      )}

      {event.emoji && (
        <div className="text-5xl leading-none mb-3">{event.emoji}</div>
      )}
      <h1 className="mt-0">{event.title}</h1>

      {event.shortDescription && (
        <p className="text-muted mt-2">{event.shortDescription}</p>
      )}

      {/* Info block */}
      <ul className="list-none p-0 m-0 space-y-2 text-lg mt-6">
        <li className="flex items-center gap-2">
          <Calendar size={20} className="shrink-0" />
          {formatDateRange(event.startTime, event.endTime ?? null)}
        </li>
        <li className="flex items-center gap-2">
          <MapPin size={20} className="shrink-0" />
          {event.locationName}
          {event.locationAddress && (
            <span className="text-muted"> · {event.locationAddress}</span>
          )}
        </li>
        {event.requiresTicket && (
          <li className="flex items-center gap-2">
            <Ticket size={20} className="shrink-0" />
            {event.ticketUrl ? (
              <a href={event.ticketUrl} target="_blank" rel="noreferrer">
                Get tickets
              </a>
            ) : (
              'Requires tickets'
            )}
          </li>
        )}
        {event.ageRestriction && (
          <li className="flex items-center gap-2">
            {event.ageRestriction === 'All ages' && (
              <Baby size={20} className="shrink-0" />
            )}
            {event.ageRestriction === 'PG-13' && (
              <ShieldUser size={20} className="shrink-0" />
            )}
            {(event.ageRestriction === '21+' ||
              event.ageRestriction === 'Some parts 21+') && (
              <Beer size={20} className="shrink-0" />
            )}
            {event.ageRestriction === '18+' && (
              <IdCard size={20} className="shrink-0" />
            )}
            {event.ageRestriction}
          </li>
        )}
        {event.dogsWelcome && (
          <li className="flex items-center gap-2">
            <Dog size={20} className="shrink-0" />
            Dogs welcome
          </li>
        )}
      </ul>

      {/* Action buttons */}
      {!cancelled && (
        <div className="flex flex-wrap gap-3 mt-6">
          <AddToCalendarButton
            title={event.title}
            startTime={event.startTime}
            endTime={event.endTime ?? null}
            description={event.description}
            locationName={event.locationName}
            locationAddress={event.locationAddress ?? null}
          />
          {event.ticketUrl && (
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block px-6 py-3 rounded-lg font-semibold text-xl transition-all duration-300 ease-out bg-brand text-inverse no-underline hover:bg-brand-hover hover:text-inverse hover:shadow-xl hover:-translate-y-1 uppercase"
            >
              Get Tickets →
            </a>
          )}
        </div>
      )}

      {/* Description (markdown) */}
      <div className="prose mt-8">
        <ReactMarkdown>{event.description}</ReactMarkdown>
      </div>

      {/* Flyer image — supplemental, below description */}
      {event.flyerUrl && (
        <div className="mt-10">
          <FlyerImage src={event.flyerUrl} alt={`${event.title} flyer`} />
        </div>
      )}

      <p className="mt-8">
        <Link href="/events">← All events</Link>
      </p>
    </main>
  )
}
