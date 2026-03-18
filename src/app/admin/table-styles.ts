import { cn } from '@/lib/utils'

/** Scrollable container with rounded border */
export const tableWrapperStyles = cn(
  'overflow-x-auto rounded-lg',
  'border border-border',
)

/** Header row: bottom border, surface background */
export const headerRowStyles = cn(
  'border-b border-border',
  'bg-surface text-left',
)

/** Body row: bottom border with hover highlight */
export const bodyRowStyles = cn(
  'border-b border-border',
  'last:border-0 hover:bg-surface',
)

/** Standard header cell */
export const thStyles = 'px-4 py-3 font-medium'

/** Standard body cell */
export const tdStyles = 'px-4 py-3'

/** Muted body cell for secondary data (dates, etc.) */
export const tdMutedStyles = 'px-4 py-3 text-muted whitespace-nowrap'

/** Right-aligned cell for action buttons */
export const actionCellStyles = cn(
  'px-4 py-3 text-right',
  'whitespace-nowrap space-x-3',
)
