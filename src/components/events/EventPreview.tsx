import { EventDetails } from '@/components/EventDetails'
import type { Event } from '@/db/schema/events'

type Props = {
  event: Event
}

export function EventPreview({ event }: Props) {
  return <EventDetails event={event} headingLevel="h1" />
}
