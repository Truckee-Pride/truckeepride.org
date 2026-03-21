'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ToggleGroup } from '@/components/ToggleGroup'

const filters = [
  { value: 'active', label: 'Active' },
  { value: 'all', label: 'All' },
  { value: 'banned', label: 'Banned' },
]

export function AdminUsersNav() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('filter') ?? 'active'

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'active') {
      params.delete('filter')
    } else {
      params.set('filter', value)
    }
    const qs = params.toString()
    router.push(qs ? `/admin/users?${qs}` : '/admin/users')
  }

  return (
    <ToggleGroup
      label="Filter users"
      options={filters}
      value={current}
      onChange={handleChange}
    />
  )
}
