import { and, desc, eq, lt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { AdminEventsTable } from '../AdminEventsTable'

export default async function PastEventsPage() {
  const pastEvents = await db.query.events.findMany({
    where: and(eq(events.status, 'approved'), lt(events.startTime, new Date())),
    orderBy: desc(events.startTime),
  })

  return (
    <>
      <h1 className="mb-6">Past Events ({pastEvents.length})</h1>
      <AdminEventsTable
        events={pastEvents}
        columns={['date', 'location']}
        emptyMessage="No past events."
      />
    </>
  )
}
