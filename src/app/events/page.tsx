import { and, asc, eq, gte } from 'drizzle-orm'
import { LayoutWidth } from '@/lib/constants'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { EventCard } from '@/components/EventCard'
import type { Metadata } from 'next'
import { AddEvent } from '@/components/AddEvent'

export const metadata: Metadata = {
  title: 'Upcoming Events',
}

export default async function EventsPage() {
  const upcomingEvents = await db.query.events.findMany({
    where: and(
      eq(events.status, 'approved'),
      gte(events.startTime, new Date()),
    ),
    orderBy: asc(events.startTime),
  })

  return (
    <main className={LayoutWidth.wide}>
      <div className="mt-8 mb-8 flex items-center justify-between gap-4">
        <h1 className="m-0">Upcoming Events</h1>
        <AddEvent />
      </div>

      {upcomingEvents.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted">
            No upcoming events right now — check back soon!
          </p>
          <p className="mt-2 text-muted">
            Have an event to share with the community?
          </p>
          <div className="mt-4 flex justify-center">
            <AddEvent />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {upcomingEvents.map((event, i) => (
            <EventCard key={event.id} event={event} colorIndex={i} />
          ))}
        </div>
      )}
    </main>
  )
}
