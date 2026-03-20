import { asc, desc, isNotNull, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { PageHeader } from '@/components/PageHeader'
import { AdminUsersNav } from './AdminUsersNav'
import { AdminUsersTable } from './AdminUsersTable'

const SORT_FIELDS = ['name', 'email', 'phone', 'createdAt'] as const
type SortField = (typeof SORT_FIELDS)[number]

function getOrderBy(sort: SortField, dir: 'asc' | 'desc') {
  const fn = dir === 'asc' ? asc : desc
  switch (sort) {
    case 'name':
      return fn(users.name)
    case 'email':
      return fn(users.email)
    case 'phone':
      return fn(users.phone)
    case 'createdAt':
      return fn(users.createdAt)
  }
}

function getFilter(filter: string) {
  switch (filter) {
    case 'banned':
      return isNotNull(users.bannedAt)
    case 'all':
      return undefined
    default:
      return isNull(users.bannedAt)
  }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string; filter?: string }>
}) {
  const params = await searchParams
  const sort = (
    SORT_FIELDS.includes(params.sort as SortField) ? params.sort : 'createdAt'
  ) as SortField
  const dir = params.dir === 'asc' ? 'asc' : ('desc' as const)
  const filter = params.filter ?? 'active'

  const where = getFilter(filter)

  const filteredUsers = await db.query.users.findMany({
    orderBy: getOrderBy(sort, dir),
    where,
  })

  return (
    <>
      <PageHeader
        title={`Users (${filteredUsers.length})`}
        accessory={<AdminUsersNav />}
      />
      <div className="mt-6">
        <AdminUsersTable users={filteredUsers} sortField={sort} sortDir={dir} />
      </div>
    </>
  )
}
