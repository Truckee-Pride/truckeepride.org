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

const headerStyles = cn(
  'flex shrink-0 items-start gap-3',
  'rounded-t-xl bg-surface',
  sectionPadding,
  'py-4',
)

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
  /** Accessible title announced to screen readers. */
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
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className={panelStyles} showCloseButton={false}>
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div className={headerStyles}>
          <div className="flex-1 min-w-0">{header}</div>
          <DialogClose className={closeButtonStyles}>
            <X size={20} />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <div className={scrollAreaStyles}>{children}</div>
      </DialogContent>
    </Dialog>
  )
}
