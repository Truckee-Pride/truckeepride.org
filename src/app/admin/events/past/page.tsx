import { and, desc, eq, lt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { AdminEventsTable } from '../AdminEventsTable'
import { PageHeader } from '@/components/PageHeader'
import { AdminEventsNav } from '../AdminEventsNav'

export default async function PastEventsPage() {
  const pastEvents = await db.query.events.findMany({
    where: and(eq(events.status, 'approved'), lt(events.startTime, new Date())),
    orderBy: desc(events.startTime),
    with: { owner: true },
  })

  return (
    <>
      <PageHeader
        title={`Past Events (${pastEvents.length})`}
        accessory={<AdminEventsNav />}
      />
      <AdminEventsTable
        events={pastEvents}
        columns={['date', 'location']}
        emptyMessage="No past events."
      />
    </>
  )
}
