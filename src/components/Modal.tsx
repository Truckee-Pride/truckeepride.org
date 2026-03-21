'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Shared horizontal padding for header and body — keeps content aligned. */
const sectionPadding = 'px-5'

const overlayStyles = cn(
  'fixed inset-0 z-50',
  'bg-black/60',
  'data-[state=open]:animate-in data-[state=open]:fade-in-0',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
)

const contentStyles = cn(
  'fixed inset-0 z-50',
  'flex items-center justify-center p-4',
)

const panelStyles = cn(
  'relative w-full max-w-2xl',
  'max-h-[calc(100dvh-2rem)]',
  'flex flex-col',
  'rounded-xl bg-background shadow-xl',
)

const headerStyles = cn(
  'flex shrink-0 items-start gap-3',
  'rounded-t-xl bg-surface',
  sectionPadding,
  'py-4',
)

const closeButtonStyles = cn(
  'ml-auto shrink-0',
  'p-1 rounded-md',
  'text-muted cursor-pointer',
  'hover:text-foreground hover:bg-background',
)

const scrollAreaStyles = cn(
  'overflow-y-auto flex-1 min-h-0',
  sectionPadding,
  'py-4',
  '[&::-webkit-scrollbar]:w-1.5',
  '[&::-webkit-scrollbar-track]:bg-transparent',
  '[&::-webkit-scrollbar-thumb]:rounded-full',
  '[&::-webkit-scrollbar-thumb]:bg-muted/50',
)

type Props = {
  /** Accessible title announced to screen readers (also used as aria-label). */
  title: string
  /** Content rendered in the gray header area, beside the close button. */
  header: React.ReactNode
  /** Scrollable body content. */
  children: React.ReactNode
  open: boolean
  onOpenChangeAction: (open: boolean) => void
}

export function Modal({
  title,
  header,
  children,
  open,
  onOpenChangeAction,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChangeAction}>
      <Dialog.Portal>
        <Dialog.Overlay className={overlayStyles} />
        <div className={contentStyles}>
          <Dialog.Content className={panelStyles} aria-label={title}>
            <Dialog.Title className="sr-only">{title}</Dialog.Title>

            <div className={headerStyles}>
              <div className="flex-1 min-w-0">{header}</div>
              <Dialog.Close className={closeButtonStyles} aria-label="Close">
                <X size={20} />
              </Dialog.Close>
            </div>

            <div className={scrollAreaStyles}>{children}</div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
