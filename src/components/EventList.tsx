import type { Event } from '@/db/schema/events'
import { fullDate, dateKey } from '@/lib/dateTimeFormatters'
import { EventCard } from './EventCard'

function groupEventsByDate(eventList: Event[]) {
  const groups: { key: string; heading: string; events: Event[] }[] = []
  let currentKey = ''

  for (const event of eventList) {
    const key = dateKey(event.startTime)
    if (key !== currentKey) {
      currentKey = key
      groups.push({
        key,
        heading: fullDate(event.startTime),
        events: [],
      })
    }
    groups[groups.length - 1].events.push(event)
  }

  return groups
}

type Props = {
  events: Event[]
  maxEvents?: number
}

export function EventList({ events, maxEvents }: Props) {
  const limited = maxEvents ? events.slice(0, maxEvents) : events
  const groups = groupEventsByDate(limited)

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.key}>
          <h2>{group.heading}</h2>
          <div className="flex flex-col gap-3">
            {group.events.map((event, i) => (
              <EventCard key={event.id} event={event} colorIndex={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
