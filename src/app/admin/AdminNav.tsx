'use client'

import { usePathname } from 'next/navigation'
import { TextLink } from '@/components/TextLink'

const tabs = [
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/sponsors', label: 'Sponsors' },
  { href: '/admin/users', label: 'Users' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-6" aria-label="Admin sections">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href)
        return (
          <TextLink
            key={tab.href}
            href={tab.href}
            intent={isActive ? 'defaultText' : 'mutedText'}
          >
            {tab.label}
          </TextLink>
        )
      })}
    </nav>
  )
}
