import { asc, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { AdminEventsTable } from './AdminEventsTable'

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
      <AdminEventsTable
        events={allEvents}
        columns={['status', 'date', 'location', 'submitted']}
        emptyMessage="No events have been created yet."
      />
    </>
  )
}
