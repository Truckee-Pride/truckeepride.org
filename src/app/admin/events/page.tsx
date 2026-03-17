import { asc, desc, eq } from 'drizzle-orm'
import Link from 'next/link'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { StatusFilter } from './StatusFilter'
import { EventsTableBody } from './EventsTableBody'

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

const VALID_STATUSES = [
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'cancelled',
] as const
type EventStatus = (typeof VALID_STATUSES)[number]

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
    ...(statusFilter ? { where: eq(events.status, statusFilter) } : {}),
  })

  return (
    <>
      <h1 className="mb-6">Events ({allEvents.length})</h1>

      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left">
              <Th>
                <SortLink
                  field="title"
                  current={sort}
                  dir={dir}
                  status={statusFilter}
                  label="Title"
                />
              </Th>
              <Th>
                <StatusFilter />
              </Th>
              <Th>
                <SortLink
                  field="startTime"
                  current={sort}
                  dir={dir}
                  status={statusFilter}
                  label="Date"
                />
              </Th>
              <Th>
                <SortLink
                  field="locationName"
                  current={sort}
                  dir={dir}
                  status={statusFilter}
                  label="Location"
                />
              </Th>
              <Th>
                <SortLink
                  field="createdAt"
                  current={sort}
                  dir={dir}
                  status={statusFilter}
                  label="Added"
                />
              </Th>
              <th className="px-4 py-3 text-right text-muted font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <EventsTableBody events={allEvents} />
        </table>
      </div>
    </>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>
}

function SortLink({
  field,
  current,
  dir,
  status,
  label,
}: {
  field: SortField
  current: SortField
  dir: 'asc' | 'desc'
  status: string | null
  label: string
}) {
  const isActive = field === current
  const nextDir = isActive && dir === 'asc' ? 'desc' : 'asc'
  const params = new URLSearchParams()
  params.set('sort', field)
  params.set('dir', nextDir)
  if (status) params.set('status', status)
  return (
    <Link
      href={`/admin/events?${params.toString()}`}
      className={`no-underline hover:underline inline-flex items-center gap-1 ${isActive ? 'text-brand' : 'text-foreground'}`}
    >
      {label}
      {isActive && <span>{dir === 'asc' ? '\u2191' : '\u2193'}</span>}
    </Link>
  )
}
