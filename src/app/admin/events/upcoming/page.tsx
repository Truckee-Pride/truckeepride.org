import { and, asc, eq, gte } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { AdminEventsTable } from '../AdminEventsTable'

export default async function UpcomingEventsPage() {
  const upcomingEvents = await db.query.events.findMany({
    where: and(
      eq(events.status, 'approved'),
      gte(events.startTime, new Date()),
    ),
    orderBy: asc(events.startTime),
  })

  return (
    <>
      <h1 className="mb-6">Upcoming Events ({upcomingEvents.length})</h1>
      <AdminEventsTable
        events={upcomingEvents}
        columns={['date', 'location']}
        emptyMessage="No upcoming events."
      />
    </>
  )
}
