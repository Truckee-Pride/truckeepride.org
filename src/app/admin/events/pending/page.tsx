import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { AdminEventsTable } from '../AdminEventsTable'

export default async function PendingEventsPage() {
  const pendingEvents = await db.query.events.findMany({
    where: eq(events.status, 'pending_review'),
    orderBy: asc(events.createdAt),
  })

  return (
    <>
      <h1 className="mb-6">Pending Events ({pendingEvents.length})</h1>
      <AdminEventsTable
        events={pendingEvents}
        columns={['date', 'location', 'submitted']}
        emptyMessage="No events awaiting review."
      />
    </>
  )
}
