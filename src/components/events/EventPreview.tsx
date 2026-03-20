import { EventDetails } from '@/components/EventDetails'
import type { Event } from '@/db/schema/events'

type Props = {
  event: Event
  accessory?: React.ReactNode
}

export function EventPreview({ event, accessory }: Props) {
  return <EventDetails event={event} headingLevel="h1" accessory={accessory} />
}
