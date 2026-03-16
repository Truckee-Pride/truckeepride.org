'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { EventDetails } from '@/components/EventDetails'
import type { Event } from '@/db/schema/events'

type Props = {
  event: Event
  onClose: () => void
}

export function EventLightbox({ event, onClose }: Props) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
    >
      <div className="relative w-full max-w-prose max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl bg-background shadow-xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-md text-muted hover:text-foreground hover:bg-surface cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <header>
          {event.emoji && (
            <div className="text-5xl leading-none mb-2">{event.emoji}</div>
          )}
          <h2 className="mt-0 mb-0 text-2xl font-bold">{event.title}</h2>
          {event.shortDescription && (
            <p className="text-muted mt-1 mb-0">{event.shortDescription}</p>
          )}
        </header>

        <EventDetails event={event} />
      </div>
    </div>
  )
}
