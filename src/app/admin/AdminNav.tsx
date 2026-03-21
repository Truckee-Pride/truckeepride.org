import { NavBar } from '@/components/NavBar'
import type { NavItem } from '@/components/NavBar'

const tabs: NavItem[] = [
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/carousel', label: 'Carousel' },
  { href: '/admin/sponsors', label: 'Sponsors' },
  { href: '/admin/users', label: 'Users' },
]

export function AdminNav() {
  return (
    <NavBar
      items={tabs}
      ariaLabel="Admin sections"
      className="justify-center"
      textClassName="text-3xl"
    />
  )
}
