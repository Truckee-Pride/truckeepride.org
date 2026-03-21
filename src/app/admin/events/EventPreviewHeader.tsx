import type { Event } from '@/db/schema/events'
import type { User } from '@/db/schema/users'
import { ApproveEventButton } from './ApproveEventButton'
import { RejectEventButton } from './RejectEventButton'
import { cn } from '@/lib/utils'
import { EditEventButton } from './EditEventButton'
import { formatPhoneNumber } from '@/lib/models/user'

const actionsRowStyles = cn('flex shrink-0 flex-wrap gap-x-4 gap-y-2')

export function EventPreviewHeader({
  event,
  owner,
}: {
  event: Event
  owner: User
}) {
  const pending = event.status === 'pending'
  return (
    <>
      <h2 className="m-0">
        <span className="capitalize">{event.status}</span> Event
      </h2>
      <section>
        <div>
          {owner.firstName} {owner.lastName}
        </div>
        <div>{owner.email}</div>
        <div>{formatPhoneNumber(owner)}</div>
      </section>

      <section className={actionsRowStyles}>
        <EditEventButton slug={event.slug} />
        {pending && (
          <>
            <ApproveEventButton id={event.id} title={event.title} />
            <RejectEventButton id={event.id} title={event.title} />
          </>
        )}
      </section>
    </>
  )
}
