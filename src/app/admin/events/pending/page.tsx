import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { DashboardActionLink } from '@/components/dashboard/DashboardActionButton'
import { ApproveEventButton } from '../ApproveEventButton'
import { RejectEventButton } from '../RejectEventButton'

export default async function PendingEventsPage() {
  const pendingEvents = await db.query.events.findMany({
    where: eq(events.status, 'pending_review'),
    orderBy: asc(events.createdAt),
  })

  return (
    <>
      <h1 className="mb-6">Pending Events ({pendingEvents.length})</h1>

      {pendingEvents.length === 0 ? (
        <p className="text-muted">No events awaiting review.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 text-right text-muted font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingEvents.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-border last:border-0 hover:bg-surface"
                >
                  <td className="px-4 py-3 font-medium">
                    {event.emoji && <span className="mr-1">{event.emoji}</span>}
                    {event.title}
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {event.startTime.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-muted">{event.locationName}</td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {event.createdAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-3">
                    <ApproveEventButton id={event.id} title={event.title} />
                    <RejectEventButton id={event.id} title={event.title} />
                    <DashboardActionLink href={`/events/${event.slug}`}>
                      View
                    </DashboardActionLink>
                    <DashboardActionLink href={`/events/${event.slug}/edit`}>
                      Edit
                    </DashboardActionLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
