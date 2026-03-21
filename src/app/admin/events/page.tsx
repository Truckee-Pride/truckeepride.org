import { asc, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { AdminEventsTable } from './AdminEventsTable'
import { PageHeader } from '@/components/PageHeader'

const SORT_FIELDS = ['title', 'startTime', 'locationName', 'createdAt'] as const
type SortField = (typeof SORT_FIELDS)[number]

const VALID_STATUSES = [
  'draft',
  'pending',
  'approved',
  'rejected',
  'cancelled',
] as const
type EventStatus = (typeof VALID_STATUSES)[number]

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
  searchParams: Promise<{ sort?: string; dir?: string; status?: string }>
}) {
  const params = await searchParams
  const sort = (
    SORT_FIELDS.includes(params.sort as SortField) ? params.sort : 'startTime'
  ) as SortField
  const dir = params.dir === 'asc' ? 'asc' : ('desc' as const)
  const statusFilter = VALID_STATUSES.includes(params.status as EventStatus)
    ? (params.status as EventStatus)
    : null

  const allEvents = await db.query.events.findMany({
    orderBy: getOrderBy(sort, dir),
    with: { owner: true },
    ...(statusFilter ? { where: eq(events.status, statusFilter) } : {}),
  })

  return (
    <>
      <PageHeader title={`All Events (${allEvents.length})`} />
      <AdminEventsTable
        events={allEvents}
        columns={['status', 'date', 'location', 'submitted']}
        sort={sort}
        dir={dir}
      />
    </>
  )
}
