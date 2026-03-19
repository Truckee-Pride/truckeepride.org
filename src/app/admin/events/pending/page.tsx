import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { AdminEventsTable } from '../AdminEventsTable'
import { PageHeader } from '@/components/PageHeader'

export default async function PendingEventsPage() {
  const pendingEvents = await db.query.events.findMany({
    where: eq(events.status, 'pending_review'),
    orderBy: asc(events.createdAt),
  })

  return (
    <>
      <PageHeader title={`Pending Events (${pendingEvents.length})`} />
      <AdminEventsTable
        events={pendingEvents}
        columns={['date', 'location', 'submitted']}
        emptyMessage="No events awaiting review."
      />
    </>
  )
}
