'use client'

import { useState } from 'react'
import type { Event } from '@/db/schema/events'
import { TextLink } from '@/components/TextLink'
import { DeleteEventButton } from './DeleteEventButton'
import { ApproveEventButton } from './ApproveEventButton'
import { RejectEventButton } from './RejectEventButton'
import { EventLightbox } from './EventLightbox'

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  pending_review: 'bg-amber-100 text-amber-800',
  draft: 'bg-gray-100 text-gray-600',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-400',
}

export function EventsTableBody({ events }: { events: Event[] }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  function handleRowClick(event: Event) {
    setSelectedEvent(event)
  }

  function handleClose() {
    setSelectedEvent(null)
  }

  return (
    <>
      <tbody>
        {events.map((event) => (
          <tr
            key={event.id}
            className="border-b border-border last:border-0 hover:bg-surface cursor-pointer"
            onClick={() => handleRowClick(event)}
          >
            <td className="px-4 py-3 font-medium">
              {event.emoji && <span className="mr-1">{event.emoji}</span>}
              {event.title}
            </td>
            <td className="px-4 py-3">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[event.status] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {event.status.replace('_', ' ')}
              </span>
            </td>
            <td className="px-4 py-3 text-muted whitespace-nowrap">
              {event.startTime.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </td>
            <td className="px-4 py-3 text-muted">{event.locationName}</td>
            <td className="px-4 py-3 text-muted whitespace-nowrap">
              {event.createdAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </td>
            <td
              className="px-4 py-3 text-right whitespace-nowrap space-x-3"
              onClick={(e) => e.stopPropagation()}
            >
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

      {selectedEvent && (
        <EventLightbox event={selectedEvent} onClose={handleClose} />
      )}
    </>
  )
}
