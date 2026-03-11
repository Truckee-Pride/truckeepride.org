import { asc, desc } from 'drizzle-orm'
import Link from 'next/link'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { DashboardActionLink } from '@/components/dashboard/DashboardActionButton'
import { DeleteEventButton } from './DeleteEventButton'

const SORT_FIELDS = [
  'title',
  'status',
  'startTime',
  'locationName',
  'createdAt',
] as const
type SortField = (typeof SORT_FIELDS)[number]

function getOrderBy(sort: SortField, dir: 'asc' | 'desc') {
  const fn = dir === 'asc' ? asc : desc
  switch (sort) {
    case 'title':
      return fn(events.title)
    case 'status':
      return fn(events.status)
    case 'startTime':
      return fn(events.startTime)
    case 'locationName':
      return fn(events.locationName)
    case 'createdAt':
      return fn(events.createdAt)
  }
}

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  pending_review: 'bg-amber-100 text-amber-800',
  draft: 'bg-gray-100 text-gray-600',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-400',
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
    <main className="max-w-6xl px-8 py-8">
      <h1 className="mb-6">Events ({allEvents.length})</h1>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left">
              <Th>
                <SortLink
                  field="title"
                  current={sort}
                  dir={dir}
                  label="Title"
                />
              </Th>
              <Th>
                <SortLink
                  field="status"
                  current={sort}
                  dir={dir}
                  label="Status"
                />
              </Th>
              <Th>
                <SortLink
                  field="startTime"
                  current={sort}
                  dir={dir}
                  label="Date"
                />
              </Th>
              <Th>
                <SortLink
                  field="locationName"
                  current={sort}
                  dir={dir}
                  label="Location"
                />
              </Th>
              <Th>
                <SortLink
                  field="createdAt"
                  current={sort}
                  dir={dir}
                  label="Added"
                />
              </Th>
              <th className="px-4 py-3 text-right text-muted font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {allEvents.map((event) => (
              <tr
                key={event.id}
                className="border-b border-border last:border-0 hover:bg-surface"
              >
                <td className="px-4 py-3 font-medium">
                  {event.emoji && <span className="mr-1">{event.emoji}</span>}
                  {event.title}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[event.status] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {event.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted whitespace-nowrap">
                  {event.startTime.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3 text-muted">{event.locationName}</td>
                <td className="px-4 py-3 text-muted whitespace-nowrap">
                  {event.createdAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap space-x-3">
                  <DashboardActionLink href={`/events/${event.slug}`}>
                    View
                  </DashboardActionLink>
                  <DashboardActionLink
                    href={`/dashboard/events/${event.id}/edit`}
                  >
                    Edit
                  </DashboardActionLink>
                  <DeleteEventButton id={event.id} title={event.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>
}

function SortLink({
  field,
  current,
  dir,
  label,
}: {
  field: SortField
  current: SortField
  dir: 'asc' | 'desc'
  label: string
}) {
  const isActive = field === current
  const nextDir = isActive && dir === 'asc' ? 'desc' : 'asc'
  return (
    <Link
      href={`/admin/events?sort=${field}&dir=${nextDir}`}
      className={`no-underline hover:underline inline-flex items-center gap-1 ${isActive ? 'text-brand' : 'text-foreground'}`}
    >
      {label}
      {isActive && <span>{dir === 'asc' ? '↑' : '↓'}</span>}
    </Link>
  )
}
