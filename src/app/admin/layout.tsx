import { LayoutWidth } from '@/lib/constants'
import { requireUser } from '@/lib/auth-stub'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()

  if (user.role !== 'admin') {
    return (
      <main className={LayoutWidth.admin}>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-subtle">
          You don&apos;t have permission to view this page.
        </p>
      </main>
    )
  }

  return <main className={LayoutWidth.admin}>{children}</main>
}
