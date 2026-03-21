'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EventDetails } from '@/components/EventDetails'
import { Notice } from '@/components/Notice'
import { EventPreviewHeader } from './EventPreviewHeader'
import type { Event } from '@/db/schema/events'
import type { User } from '@/db/schema/users'
import { LayoutWidth } from '@/lib/constants'

type Props = {
  event: Event & { owner: User }
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
    'max-h-[calc(100dvh-2rem)]',
    'flex flex-col',
    'rounded-xl bg-surface shadow-xl',
  )

  const panelInnerStyles = cn('flex flex-col flex-1 min-h-0')

  const headerRowStyles = cn('flex shrink-0 w-full items-start py-4')

  const scrollAreaStyles = cn(
    'overflow-y-auto flex-1 min-h-0',
    'p-4',
    '[&::-webkit-scrollbar]:w-1.5',
    '[&::-webkit-scrollbar-track]:bg-transparent',
    '[&::-webkit-scrollbar-thumb]:rounded-full',
    '[&::-webkit-scrollbar-thumb]:bg-muted/50',
  )

  const closeButtonStyles = cn(
    'flex-shrink',
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
        <div className={panelInnerStyles}>
          <div className={headerRowStyles}>
            <div className="flex-1 min-w-0">
              <EventPreviewHeader event={event} owner={event.owner} />
            </div>
            <button
              onClick={onCloseAction}
              className={closeButtonStyles}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className={scrollAreaStyles}>
            <header>
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
          </div>
        </div>
      </div>
    </div>
  )
}
