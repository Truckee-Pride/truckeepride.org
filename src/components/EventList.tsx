import type { Event } from '@/db/schema/events'
import { EventCard } from './EventCard'

const TZ = 'America/Los_Angeles'

function formatDateHeading(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function getDateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function groupEventsByDate(eventList: Event[]) {
  const groups: { key: string; heading: string; events: Event[] }[] = []
  let currentKey = ''

  for (const event of eventList) {
    const key = getDateKey(event.startTime)
    if (key !== currentKey) {
      currentKey = key
      groups.push({
        key,
        heading: formatDateHeading(event.startTime),
        events: [],
      })
    }
    groups[groups.length - 1].events.push(event)
  }

  return groups
}

type Props = {
  events: Event[]
}

export function EventList({ events }: Props) {
  const groups = groupEventsByDate(events)

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
