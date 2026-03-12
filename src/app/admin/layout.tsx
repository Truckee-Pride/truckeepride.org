import { LayoutWidth } from '@/lib/constants'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <main className={LayoutWidth.admin}>{children}</main>
}
