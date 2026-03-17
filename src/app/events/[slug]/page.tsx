import { eq } from 'drizzle-orm'
import { LayoutWidth } from '@/lib/constants'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Edit2 } from 'lucide-react'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { EventPreview } from '@/components/events/EventPreview'
import { Button } from '@/components/Button'
import { AddToCalendarButton } from './AddToCalendarButton'
import { getCurrentUser } from '@/lib/auth-stub'
import { canEditEvent } from '@/lib/permissions'
import { Notice } from '@/components/Notice'

const PUBLIC_STATUSES = ['approved', 'cancelled']

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const event = await db.query.events.findFirst({
    where: eq(events.slug, slug),
  })
  if (!event) return {}

  // Only show metadata for public events, or non-public if viewer is owner/admin
  if (!PUBLIC_STATUSES.includes(event.status)) {
    const user = await getCurrentUser()
    if (!user || !(await canEditEvent(user, event))) return {}
  }

  const description = event.shortDescription ?? event.description.slice(0, 160)
  const images = event.flyerUrl ? [event.flyerUrl] : undefined
  return {
    title: event.title,
    description,
    openGraph: { images },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images,
    },
  }
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

  const user = await getCurrentUser()

  // Non-public events are only visible to owners and admins
  if (!PUBLIC_STATUSES.includes(event.status)) {
    if (!user || !(await canEditEvent(user, event))) notFound()
  }

  const canEdit = user ? await canEditEvent(user, event) : false

  const cancelled = event.status === 'cancelled'
  const pendingReview = event.status === 'pending_review'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.shortDescription ?? event.description.slice(0, 160),
    startDate: event.startTime.toISOString(),
    endDate: event.endTime?.toISOString(),
    eventStatus: cancelled
      ? 'https://schema.org/EventCancelled'
      : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.locationName,
      address: event.locationAddress ?? event.locationName,
    },
    image: event.flyerUrl ?? undefined,
    url: `https://truckeepride.org/events/${event.slug}`,
    organizer: {
      '@type': 'Organization',
      name: 'Truckee Pride',
      url: 'https://truckeepride.org',
    },
  }

  return (
    <main className={LayoutWidth.prose}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {pendingReview && (
        <Notice>
          <strong>Submitted for review.</strong> Your event will go live once an
          admin approves it.
        </Notice>
      )}
      {cancelled && (
        <Notice intent="danger">
          <strong>This event has been cancelled.</strong>
        </Notice>
      )}

      <EventPreview event={event} />

      {/* Action buttons */}
      {!cancelled && (
        <section className="mt-10">
          <div className="flex flex-wrap gap-3 mt-6">
            <AddToCalendarButton
              title={event.title}
              startTime={event.startTime}
              endTime={event.endTime ?? null}
              description={event.description}
              locationName={event.locationName}
              locationAddress={event.locationAddress ?? null}
            />
            {canEdit && (
              <Button href={`/events/${event.slug}/edit`}>
                <Edit2 className="inline-block mr-2 -mt-0.5" size={20} />
                Edit Event
              </Button>
            )}
            {event.ticketUrl && (
              <Button onClick={() => window.open(event.ticketUrl!, '_blank')}>
                Get Tickets →
              </Button>
            )}
          </div>
        </section>
      )}

      <p className="mt-8">
        <Link href="/events">← All events</Link>
      </p>
    </main>
  )
}
