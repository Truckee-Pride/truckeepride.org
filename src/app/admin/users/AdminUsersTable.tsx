import { cn } from '@/lib/utils'
import { Avatar } from '@/components/Avatar'
import { TextLink } from '@/components/TextLink'
import { BanUserButton } from './BanUserButton'
import type { User } from '@/db/schema/users'
import {
  tableWrapperStyles,
  headerRowStyles,
  bodyRowStyles,
  thStyles,
  tdStyles,
  tdMutedStyles,
  actionCellStyles,
} from '../table-styles'

type Props = {
  users: User[]
  sortField: string
  sortDir: 'asc' | 'desc'
}

const bannedBadgeStyles = cn(
  'ml-2 inline-block rounded-full',
  'bg-red-100 px-2 py-0.5',
  'text-xs font-medium text-red-700',
)

function gravatarUrl(email: string): string {
  return `https://www.gravatar.com/avatar/${email.trim().toLowerCase()}?d=404&s=64`
}

function SortHeader({
  label,
  field,
  currentSort,
  currentDir,
}: {
  label: string
  field: string
  currentSort: string
  currentDir: 'asc' | 'desc'
}) {
  const isActive = currentSort === field
  const nextDir = isActive && currentDir === 'asc' ? 'desc' : 'asc'
  const arrow = isActive ? (currentDir === 'asc' ? ' ↑' : ' ↓') : ''

  return (
    <th className={thStyles}>
      <TextLink
        href={`?sort=${field}&dir=${nextDir}`}
        intent={isActive ? 'defaultText' : 'mutedText'}
      >
        {label}
        {arrow}
      </TextLink>
    </th>
  )
}

export function AdminUsersTable({
  users: userList,
  sortField,
  sortDir,
}: Props) {
  if (userList.length === 0) {
    return <p className="text-muted">No users found.</p>
  }

  return (
    <div className={tableWrapperStyles}>
      <table className="w-full text-sm">
        <thead>
          <tr className={headerRowStyles}>
            <th className={thStyles}>User</th>
            <SortHeader
              label="Email"
              field="email"
              currentSort={sortField}
              currentDir={sortDir}
            />
            <SortHeader
              label="Phone"
              field="phone"
              currentSort={sortField}
              currentDir={sortDir}
            />
            <SortHeader
              label="Joined"
              field="createdAt"
              currentSort={sortField}
              currentDir={sortDir}
            />
            <th className={cn(thStyles, 'text-right text-muted')}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {userList.map((user) => {
            const avatarSrc = user.image ?? gravatarUrl(user.email)
            return (
              <tr key={user.id} className={bodyRowStyles}>
                <td className={cn(tdStyles, 'font-medium')}>
                  <span className="flex items-center gap-2">
                    <Avatar src={avatarSrc} name={user.name} />
                    <span>
                      {user.name ?? '—'}
                      {user.bannedAt && (
                        <span className={bannedBadgeStyles}>Banned</span>
                      )}
                    </span>
                  </span>
                </td>
                <td className={tdMutedStyles}>{user.email}</td>
                <td className={tdMutedStyles}>{user.phone ?? '—'}</td>
                <td className={tdMutedStyles}>
                  {user.createdAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className={actionCellStyles}>
                  <BanUserButton
                    id={user.id}
                    name={user.name}
                    isBanned={user.bannedAt != null}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
