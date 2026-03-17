import { PageHeader } from '@/components/PageHeader'
import { EventDetails } from '@/components/EventDetails'
import type { Event } from '@/db/schema/events'

type Props = {
  event: Event
}

export function EventPreview({ event }: Props) {
  return (
    <>
      <PageHeader
        title={event.title}
        subtitle={event.shortDescription ?? undefined}
        emoji={event.emoji ?? undefined}
      />
      <EventDetails event={event} />
    </>
  )
}
