'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EventDetails } from '@/components/EventDetails'
import type { Event } from '@/db/schema/events'
import { LayoutWidth } from '@/lib/constants'

type Props = {
  event: Event
  onCloseAction: () => void
}

export function EventLightbox({ event, onCloseAction }: Props) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseAction()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCloseAction])

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onCloseAction()
  }

  const backdropStyles = cn(
    'fixed inset-0 z-50',
    'flex items-center justify-center',
    'bg-black/60 p-4',
  )

  const panelStyles = cn(
    'relative w-full',
    LayoutWidth.wide,
    'max-h-[calc(100dvh-2rem)] overflow-y-auto',
    'rounded-xl bg-background shadow-xl',
    'p-6 sm:p-8',
  )

  const closeButtonStyles = cn(
    'absolute top-3 right-3',
    'p-1 rounded-md',
    'text-muted cursor-pointer',
    'hover:text-foreground hover:bg-surface',
  )

  return (
    <div
      className={backdropStyles}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
    >
      <div className={panelStyles}>
        <button
          onClick={onCloseAction}
          className={closeButtonStyles}
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
