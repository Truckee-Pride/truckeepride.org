import Link from 'next/link'
import { CalendarPlus } from 'lucide-react'

export function AddEvent() {
  return (
    <Link
      href="/events/new"
      className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-inverse no-underline transition-colors hover:bg-brand-hover"
    >
      <CalendarPlus size={16} />
      Submit an Event
    </Link>
  )
}
