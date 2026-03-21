import { TextLink } from '@/components/TextLink'
import { numericDate } from '@/lib/dateTimeFormatters'
import { DeleteEventButton } from './DeleteEventButton'
import { ApproveEventButton } from './ApproveEventButton'
import { RejectEventButton } from './RejectEventButton'
import { cn } from '@/lib/utils'
import type { Event } from '@/db/schema/events'
import {
  tableWrapperStyles,
  headerRowStyles,
  bodyRowStyles,
  thStyles,
  tdStyles,
  tdMutedStyles,
  actionCellStyles,
} from '../table-styles'

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  pending_review: 'bg-amber-100 text-amber-800',
  draft: 'bg-gray-100 text-gray-600',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-400',
}

const statusBadgeStyles = cn(
  'inline-block rounded-full px-2 py-0.5',
  'text-xs font-medium capitalize',
)

type Column = 'status' | 'date' | 'location' | 'submitted'

type Props = {
  events: Event[]
  columns?: Column[]
  emptyMessage?: string
}

const DEFAULT_COLUMNS: Column[] = ['date', 'location']

export function AdminEventsTable({
  events: eventList,
  columns = DEFAULT_COLUMNS,
  emptyMessage = 'No events found.',
}: Props) {
  const showStatus = columns.includes('status')
  const showDate = columns.includes('date')
  const showLocation = columns.includes('location')
  const showSubmitted = columns.includes('submitted')

  if (eventList.length === 0) {
    return <p className="text-muted">{emptyMessage}</p>
  }

  return (
    <div className={tableWrapperStyles}>
      <table className="w-full text-sm">
        <thead>
          <tr className={headerRowStyles}>
            <th className={thStyles}>Title</th>
            {showStatus && <th className={thStyles}>Status</th>}
            {showDate && <th className={thStyles}>Date</th>}
            {showLocation && <th className={thStyles}>Location</th>}
            {showSubmitted && <th className={thStyles}>Submitted</th>}
            <th className={cn(thStyles, 'text-right text-muted')}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {eventList.map((event) => (
            <tr key={event.id} className={bodyRowStyles}>
              <td className={cn(tdStyles, 'font-medium')}>
                {event.emoji && <span className="mr-1">{event.emoji}</span>}
                {event.title}
              </td>
              {showStatus && (
                <td className={tdStyles}>
                  <span
                    className={cn(
                      statusBadgeStyles,
                      STATUS_STYLES[event.status] ??
                        'bg-gray-100 text-gray-600',
                    )}
                  >
                    {event.status.replace('_', ' ')}
                  </span>
                </td>
              )}
              {showDate && (
                <td className={tdMutedStyles}>
                  {numericDate(event.startTime)}
                </td>
              )}
              {showLocation && (
                <td className={cn(tdStyles, 'text-muted')}>
                  {event.locationName}
                </td>
              )}
              {showSubmitted && (
                <td className={tdMutedStyles}>
                  {numericDate(event.createdAt)}
                </td>
              )}
              <td className={actionCellStyles}>
                {event.status === 'pending_review' && (
                  <>
                    <ApproveEventButton id={event.id} title={event.title} />
                    <RejectEventButton id={event.id} title={event.title} />
                  </>
                )}
                <TextLink href={`/events/${event.slug}`}>View</TextLink>
                <TextLink href={`/events/${event.slug}/edit`}>Edit</TextLink>
                <DeleteEventButton id={event.id} title={event.title} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
