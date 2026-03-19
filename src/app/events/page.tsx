import { and, asc, desc, eq, gte, lte, arrayOverlaps } from 'drizzle-orm'
import type { Metadata } from 'next'
import { LayoutWidth } from '@/lib/constants'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { EventCard } from '@/components/EventCard'
import { AddEvent } from '@/components/AddEvent'
import { EventFilters } from './EventFilters'
import {
  VIBE_TAGS,
  AGE_RESTRICTION_OPTIONS,
  type VibeTag,
  type AgeRestriction,
} from '@/lib/schemas/events'
import { PageHeader } from '@/components/PageHeader'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ time?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  return {
    title: params.time === 'past' ? 'Past Events' : 'Upcoming Events',
  }
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ time?: string; tags?: string; age?: string }>
}) {
  const params = await searchParams

  const time = params.time === 'past' ? 'past' : 'upcoming'

  const tagList = params.tags
    ? params.tags
        .split(',')
        .filter((t): t is VibeTag =>
          (VIBE_TAGS as readonly string[]).includes(t),
        )
    : []

  const ageFilter = (AGE_RESTRICTION_OPTIONS as readonly string[]).includes(
    params.age ?? '',
  )
    ? (params.age as AgeRestriction)
    : null

  // Build query conditions
  const conditions = [eq(events.status, 'approved')]

  if (time === 'upcoming') {
    conditions.push(gte(events.startTime, new Date()))
  } else {
    conditions.push(lte(events.startTime, new Date()))
  }

  if (ageFilter) {
    conditions.push(eq(events.ageRestriction, ageFilter))
  }

  if (tagList.length > 0) {
    conditions.push(arrayOverlaps(events.vibeTags, tagList))
  }

  const filteredEvents = await db.query.events.findMany({
    where: and(...conditions),
    orderBy: time === 'past' ? desc(events.startTime) : asc(events.startTime),
  })

  const hasFilters = tagList.length > 0 || ageFilter != null

  return (
    <main className={LayoutWidth.wide}>
      <PageHeader
        title={time === 'past' ? 'Past Events' : 'Upcoming Events'}
        accessory={<AddEvent />}
      />

      <div className="mb-6">
        <EventFilters time={time} tags={tagList} age={ageFilter} />
      </div>

      {filteredEvents.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted">
            {hasFilters
              ? 'No events match your filters.'
              : time === 'past'
                ? 'No past events yet.'
                : 'No upcoming events right now — check back soon!'}
          </p>
          {!hasFilters && time === 'upcoming' && (
            <>
              <p className="mt-2 text-muted">
                Have an event to share with the community?
              </p>
              <div className="mt-4 flex justify-center">
                <AddEvent />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredEvents.map((event, i) => (
            <EventCard key={event.id} event={event} colorIndex={i} />
          ))}
        </div>
      )}
    </main>
  )
}
