import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
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
    openGraph: event.imageUrl ? { images: [event.imageUrl] } : undefined,
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
  const title = event.emoji ? `${event.emoji} ${event.title}` : event.title

  return (
    <main>
      {cancelled && (
        <div className="bg-red-100 border border-red-400 text-red-800 rounded-lg px-4 py-3 mb-6 font-semibold">
          This event has been cancelled.
        </div>
      )}

      <h1 className="mt-0">{title}</h1>

      {event.shortDescription && (
        <p className="text-muted mt-2">{event.shortDescription}</p>
      )}

      {/* Info block */}
      <ul className="list-none p-0 m-0 space-y-2 text-lg mt-6">
        <li>📅 {formatDateRange(event.startTime, event.endTime ?? null)}</li>
        <li>
          📍 {event.locationName}
          {event.locationAddress && (
            <span className="text-muted"> · {event.locationAddress}</span>
          )}
        </li>
        <li>
          🎟️ {event.requiresTicket ? 'Tickets required' : 'Free admission'}
        </li>
        {event.ageRestriction && <li>🔞 {event.ageRestriction}</li>}
        {event.dogsWelcome && <li>🐕 Dogs welcome</li>}
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
          {event.externalUrl && (
            <a
              href={event.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block px-6 py-3 rounded-lg font-semibold text-xl transition-all duration-300 ease-out bg-brand text-inverse no-underline hover:bg-brand-hover hover:text-inverse hover:shadow-xl hover:-translate-y-1 uppercase"
            >
              {event.requiresTicket ? 'Get Tickets →' : 'More Info →'}
            </a>
          )}
        </div>
      )}

      {/* Description (markdown) */}
      <div className="prose mt-8">
        <ReactMarkdown>{event.description}</ReactMarkdown>
      </div>

      {/* Flyer image — supplemental, below description */}
      {event.imageUrl && (
        <div className="mt-10">
          <small>Event flyer</small>
          <div className="mt-2">
            <FlyerImage src={event.imageUrl} alt={`${event.title} flyer`} />
          </div>
        </div>
      )}

      <p className="mt-8">
        <Link href="/events">← All events</Link>
      </p>
    </main>
  )
}
