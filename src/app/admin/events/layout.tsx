import { LayoutWidth } from '@/lib/constants'
import { AdminEventsNav } from './AdminEventsNav'

export default function AdminEventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className={LayoutWidth.admin}>
      <div className="mt-8 mb-6">
        <AdminEventsNav />
      </div>
      {children}
    </main>
  )
}
