'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { MoveUp, MoveDown } from 'lucide-react'
import { TextLink } from '@/components/TextLink'
import { StatusFilter } from './StatusFilter'
import { DeleteEventButton } from './DeleteEventButton'
import { ApproveEventButton } from './ApproveEventButton'
import { EditEventButton } from './EditEventButton'
import { RejectEventButton } from './RejectEventButton'
import { EventPreviewModal } from './EventPreviewModal'
import { cn } from '@/lib/utils'
import type { Event } from '@/db/schema/events'
import type { User } from '@/db/schema/users'
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
  pending: 'bg-amber-100 text-amber-800',
  draft: 'bg-gray-100 text-gray-600',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-400',
}

const statusBadgeStyles = cn(
  'inline-block rounded-full px-2 py-0.5',
  'text-xs font-medium capitalize',
)

type EventWithOwner = Event & { owner: User }

type Column = 'status' | 'date' | 'location' | 'submitted'

type SortField = 'title' | 'startTime' | 'locationName' | 'createdAt'

type Props = {
  events: EventWithOwner[]
  columns?: Column[]
  emptyMessage?: string
  sort?: SortField
  dir?: 'asc' | 'desc'
}

const COLUMN_SORT_FIELD: Partial<Record<Column, SortField>> = {
  date: 'startTime',
  location: 'locationName',
  submitted: 'createdAt',
}

const DEFAULT_COLUMNS: Column[] = ['date', 'location']

export function AdminEventsTable({
  events: eventList,
  columns = DEFAULT_COLUMNS,
  emptyMessage = 'No events found.',
  sort,
  dir,
}: Props) {
  const [selectedEvent, setSelectedEvent] = useState<EventWithOwner | null>(
    null,
  )

  function handleRowClick(event: EventWithOwner) {
    setSelectedEvent(event)
  }

  function handleClose() {
    setSelectedEvent(null)
  }

  const showStatus = columns.includes('status')
  const showDate = columns.includes('date')
  const showLocation = columns.includes('location')
  const showSubmitted = columns.includes('submitted')

  if (eventList.length === 0) {
    return <p className="text-muted">{emptyMessage}</p>
  }

  return (
    <>
      <div className={tableWrapperStyles}>
        <table className="w-full text-sm">
          <thead>
            <tr className={headerRowStyles}>
              <th className={thStyles}>
                <SortLink field="title" label="Title" sort={sort} dir={dir} />
              </th>
              {showStatus && (
                <th className={thStyles}>
                  <StatusFilter />
                </th>
              )}
              {showDate && (
                <th className={thStyles}>
                  <SortLink
                    field={COLUMN_SORT_FIELD.date!}
                    label="Date"
                    sort={sort}
                    dir={dir}
                  />
                </th>
              )}
              {showLocation && (
                <th className={thStyles}>
                  <SortLink
                    field={COLUMN_SORT_FIELD.location!}
                    label="Location"
                    sort={sort}
                    dir={dir}
                  />
                </th>
              )}
              {showSubmitted && (
                <th className={thStyles}>
                  <SortLink
                    field={COLUMN_SORT_FIELD.submitted!}
                    label="Submitted"
                    sort={sort}
                    dir={dir}
                  />
                </th>
              )}
              <th className={cn(thStyles, 'text-muted text-right')}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {eventList.map((event) => (
              <tr
                key={event.id}
                className={cn(bodyRowStyles, 'cursor-pointer')}
                onClick={() => handleRowClick(event)}
              >
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
                    {event.startTime.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                )}
                {showLocation && (
                  <td className={cn(tdStyles, 'text-muted')}>
                    {event.locationName}
                  </td>
                )}
                {showSubmitted && (
                  <td className={tdMutedStyles}>
                    {event.createdAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                )}
                <td
                  className={actionCellStyles}
                  onClick={(e) => e.stopPropagation()}
                >
                  {event.status === 'pending' && (
                    <>
                      <ApproveEventButton id={event.id} title={event.title} />
                      <RejectEventButton id={event.id} title={event.title} />
                    </>
                  )}
                  <TextLink href={`/events/${event.slug}`}>View</TextLink>
                  <EditEventButton slug={event.slug} />
                  <DeleteEventButton id={event.id} title={event.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedEvent && (
        <EventPreviewModal event={selectedEvent} onCloseAction={handleClose} />
      )}
    </>
  )
}

function SortLink({
  field,
  label,
  sort,
  dir,
}: {
  field: SortField
  label: string
  sort?: SortField
  dir?: 'asc' | 'desc'
}) {
  const searchParams = useSearchParams()
  const isActive = sort === field
  const nextDir = isActive && dir === 'asc' ? 'desc' : 'asc'
  const params = new URLSearchParams(searchParams.toString())
  params.set('sort', field)
  params.set('dir', nextDir)
  return (
    <Link
      href={`/admin/events?${params.toString()}`}
      className={cn(
        'text-foreground inline-flex cursor-pointer items-center gap-1 font-medium no-underline hover:underline',
      )}
    >
      {label}
      {isActive && (
        <span className="text-xs">
          {dir === 'asc' ? (
            <MoveUp aria-hidden className="text-subtle size-4" />
          ) : (
            <MoveDown aria-hidden className="text-subtle size-4" />
          )}
        </span>
      )}
    </Link>
  )
}
