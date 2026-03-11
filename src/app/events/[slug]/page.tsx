import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { events } from '@/db/schema'

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

  return (
    <main>
      <h1>{event.title}</h1>
      <dl>
        <dt>ID</dt>
        <dd>{event.id}</dd>
        <dt>Slug</dt>
        <dd>{event.slug}</dd>
        <dt>Status</dt>
        <dd>{event.status}</dd>
        <dt>Emoji</dt>
        <dd>{event.emoji ?? '—'}</dd>
        <dt>Short description</dt>
        <dd>{event.shortDescription ?? '—'}</dd>
        <dt>Description</dt>
        <dd>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
            {event.description}
          </pre>
        </dd>
        <dt>Location</dt>
        <dd>{event.locationName}</dd>
        <dt>Location address</dt>
        <dd>{event.locationAddress ?? '—'}</dd>
        <dt>Start time</dt>
        <dd>{event.startTime.toISOString()}</dd>
        <dt>End time</dt>
        <dd>{event.endTime?.toISOString() ?? '—'}</dd>
        <dt>Requires ticket</dt>
        <dd>{event.requiresTicket ? 'Yes' : 'No'}</dd>
        <dt>Age restriction</dt>
        <dd>{event.ageRestriction ?? 'All ages'}</dd>
        <dt>Dogs welcome</dt>
        <dd>{event.dogsWelcome ? 'Yes' : 'No'}</dd>
        <dt>Image</dt>
        <dd>
          {event.imageUrl ? (
            <a href={event.imageUrl} target="_blank" rel="noreferrer">
              {event.imageUrl}
            </a>
          ) : (
            '—'
          )}
        </dd>
        <dt>External URL</dt>
        <dd>
          {event.externalUrl ? (
            <a href={event.externalUrl} target="_blank" rel="noreferrer">
              {event.externalUrl}
            </a>
          ) : (
            '—'
          )}
        </dd>
        <dt>Created at</dt>
        <dd>{event.createdAt.toISOString()}</dd>
        <dt>Updated at</dt>
        <dd>{event.updatedAt.toISOString()}</dd>
      </dl>
    </main>
  )
}
