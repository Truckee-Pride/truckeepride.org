import { LayoutWidth } from '@/lib/constants'
import { requireUser } from '@/lib/auth-stub'
import { AdminNav } from './AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()

  if (user.role !== 'admin') {
    return (
      <main className={LayoutWidth.wide}>
        <h1>Access Denied</h1>
        <p className="text-subtle">
          You don&apos;t have permission to view this page.
        </p>
      </main>
    )
  }

  return (
    <main className={LayoutWidth.admin}>
      <AdminNav />
      <div className="mt-6">{children}</div>
    </main>
  )
}
