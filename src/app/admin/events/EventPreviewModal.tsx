'use client'

import { Modal } from '@/components/Modal'
import { EventDetails } from '@/components/EventDetails'
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
      title={`${event.status.charAt(0).toUpperCase()}${event.status.slice(1)} Event`}
      open={true}
      onOpenChangeAction={handleOpenChange}
      header={<EventPreviewHeader event={event} owner={event.owner} />}
    >
      <EventDetails event={event} />
    </Modal>
  )
}
