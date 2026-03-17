import { and, asc, eq, gte } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { TextLink } from '@/components/TextLink'
import { DeleteEventButton } from '../DeleteEventButton'

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

      {upcomingEvents.length === 0 ? (
        <p className="text-muted">No upcoming events.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 text-right text-muted font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {upcomingEvents.map((event) => (
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
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-3">
                    <TextLink href={`/events/${event.slug}`}>View</TextLink>
                    <TextLink href={`/events/${event.slug}/edit`}>
                      Edit
                    </TextLink>
                    <DeleteEventButton id={event.id} title={event.title} />
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
