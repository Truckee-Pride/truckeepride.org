import { AdminEventsNav } from './AdminEventsNav'

export default function AdminEventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="mt-2 mb-6">
        <AdminEventsNav />
      </div>
      {children}
    </>
  )
}
