import { and, asc, eq, gte } from 'drizzle-orm'
import { LayoutWidth } from '@/lib/constants'
import Link from 'next/link'
import { CalendarPlus } from 'lucide-react'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { EventCard } from '@/components/EventCard'

export const metadata = {
  title: 'Upcoming Events',
}

export default async function EventsPage() {
  const upcomingEvents = await db.query.events.findMany({
    where: and(
      eq(events.status, 'approved'),
      // gte(events.startTime, new Date()),
    ),
    orderBy: asc(events.startTime),
  })

  return (
    <main className={LayoutWidth.wide}>
      <div className="mt-8 mb-8 flex items-center justify-between gap-4">
        <h1 className="m-0">Upcoming Events</h1>
        <Link
          href="/dashboard/events/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-inverse no-underline transition-colors hover:bg-brand-hover"
        >
          <CalendarPlus size={16} />
          Add Event
        </Link>
      </div>

      {upcomingEvents.length === 0 ? (
        <p className="text-muted">No upcoming events — check back soon!</p>
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
