'use client'

import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { X } from 'lucide-react'

/** Shared horizontal padding for header and body — keeps content aligned. */
const sectionPadding = 'px-5'

const panelStyles = cn(
  'max-w-2xl max-h-[calc(100dvh-2rem)]',
  'flex flex-col gap-0 p-0',
  'rounded-xl bg-background',
)

const titleRowStyles = cn(
  'flex shrink-0 items-center gap-3',
  'rounded-t-xl bg-surface',
  sectionPadding,
  'pt-4',
  'pb-0',
)

const headerStyles = cn('shrink-0 bg-surface', sectionPadding, 'pb-4')

const closeButtonStyles = cn(
  'static ml-auto shrink-0',
  'p-1 rounded-md opacity-100',
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
  /** Visible title shown in the top row alongside the close button. */
  title: string
  /** Content rendered in the header area below the title row. */
  header?: React.ReactNode
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
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className={panelStyles} showCloseButton={false}>
        <div className={titleRowStyles}>
          <DialogTitle className="m-0 min-w-0 flex-1">{title}</DialogTitle>
          <DialogClose className={closeButtonStyles}>
            <X size={20} />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        {header && <div className={headerStyles}>{header}</div>}

        <div className={scrollAreaStyles}>{children}</div>
      </DialogContent>
    </Dialog>
  )
}
