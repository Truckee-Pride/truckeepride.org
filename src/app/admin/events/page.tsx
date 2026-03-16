import { asc, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { EventsTableBody } from './EventsTableBody'
import {
  tableWrapperStyles,
  headerRowStyles,
  thStyles,
} from '../table-styles'
import { cn } from '@/lib/utils'

const SORT_FIELDS = ['title', 'startTime', 'locationName', 'createdAt'] as const
type SortField = (typeof SORT_FIELDS)[number]

function getOrderBy(sort: SortField, dir: 'asc' | 'desc') {
  const fn = dir === 'asc' ? asc : desc
  switch (sort) {
    case 'title':
      return fn(events.title)
    case 'startTime':
      return fn(events.startTime)
    case 'locationName':
      return fn(events.locationName)
    case 'createdAt':
      return fn(events.createdAt)
  }
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string }>
}) {
  const params = await searchParams
  const sort = (
    SORT_FIELDS.includes(params.sort as SortField) ? params.sort : 'startTime'
  ) as SortField
  const dir = params.dir === 'asc' ? 'asc' : ('desc' as const)

  const allEvents = await db.query.events.findMany({
    orderBy: getOrderBy(sort, dir),
  })

  return (
    <>
      <h1 className="mb-6">All Events ({allEvents.length})</h1>

      <div className={tableWrapperStyles}>
        <table className="w-full text-sm">
          <thead>
            <tr className={headerRowStyles}>
              <th className={thStyles}>Title</th>
              <th className={thStyles}>Status</th>
              <th className={thStyles}>Date</th>
              <th className={thStyles}>Location</th>
              <th className={thStyles}>Submitted</th>
              <th className={cn(thStyles, 'text-right text-muted')}>Actions</th>
            </tr>
          </thead>
          <EventsTableBody events={allEvents} />
        </table>
      </div>
    </>
  )
}
