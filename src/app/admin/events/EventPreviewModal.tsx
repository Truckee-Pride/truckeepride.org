'use client'

import { Modal } from '@/components/Modal'
import { EventDetails } from '@/components/EventDetails'
import { Notice } from '@/components/Notice'
import { EventPreviewHeader } from './EventPreviewHeader'
import type { Event } from '@/db/schema/events'
import type { User } from '@/db/schema/users'

type Props = {
  event: Event & { owner: User }
  onCloseAction: () => void
}

export function EventPreviewModal({ event, onCloseAction }: Props) {
  function handleOpenChange(open: boolean) {
    if (!open) onCloseAction()
  }

  return (
    <Modal
      title={event.title}
      open={true}
      onOpenChangeAction={handleOpenChange}
      header={<EventPreviewHeader event={event} owner={event.owner} />}
    >
      <header className="mt-0">
        {event.emoji && (
          <div className="text-5xl leading-none mb-2">{event.emoji}</div>
        )}
        <h2 className="mt-0 mb-0 text-2xl font-bold">{event.title}</h2>
        {event.shortDescription && (
          <p className="text-muted mt-1 mb-0">{event.shortDescription}</p>
        )}
      </header>

      {event.status === 'pending' &&
        (event.ticketUrl ??
          /\[.+?\]\([a-z]+:/.test(event.description ?? '')) && (
          <Notice intent="warning">
            <strong>Before approving:</strong> verify any links in the
            description and ticket URL lead to legitimate, safe sites.
          </Notice>
        )}
      <EventDetails event={event} />
    </Modal>
  )
}
