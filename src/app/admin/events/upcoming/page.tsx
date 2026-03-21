import { and, asc, eq, gte } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { AdminEventsTable } from '../AdminEventsTable'
import { PageHeader } from '@/components/PageHeader'

export default async function UpcomingEventsPage() {
  const upcomingEvents = await db.query.events.findMany({
    where: and(
      eq(events.status, 'approved'),
      gte(events.startTime, new Date()),
    ),
    orderBy: asc(events.startTime),
    with: { owner: true },
  })

  return (
    <>
      <PageHeader title={`Upcoming Events (${upcomingEvents.length})`} />
      <AdminEventsTable
        events={upcomingEvents}
        columns={['date', 'location']}
        emptyMessage="No upcoming events."
      />
    </>
  )
}
