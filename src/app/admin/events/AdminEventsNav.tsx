'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ToggleGroup } from '@/components/ToggleGroup'

const views = [
  { value: '/admin/events', label: 'All' },
  { value: '/admin/events/upcoming', label: 'Upcoming' },
  { value: '/admin/events/past', label: 'Past' },
  { value: '/admin/events/pending', label: 'Pending' },
]

export function AdminEventsNav() {
  const pathname = usePathname()
  const router = useRouter()

  const current =
    views.find((v) => pathname === v.value)?.value ?? '/admin/events'

  function handleChange(value: string) {
    router.push(value)
  }

  return (
    <ToggleGroup
      label="Filter events"
      options={views}
      value={current}
      onChange={handleChange}
    />
  )
}
