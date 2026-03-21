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

  const hasExternalLinks =
    event.ticketUrl ?? /\[.+?\]\([a-z]+:/.test(event.description ?? '')

  return (
    <Modal
      title={event.title}
      open={true}
      onOpenChangeAction={handleOpenChange}
      header={<EventPreviewHeader event={event} owner={event.owner} />}
    >
      {event.status === 'pending' && hasExternalLinks && (
        <Notice intent="warning">
          <strong>Before approving:</strong> verify any links in the description
          and ticket URL lead to legitimate, safe sites.
        </Notice>
      )}
      <EventDetails event={event} />
    </Modal>
  )
}
