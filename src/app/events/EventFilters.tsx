'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ToggleGroup } from '@/components/ToggleGroup'
import { FilterSelect } from '@/components/FilterSelect'
import { ToggleChip } from '@/components/ToggleChip'
import { VIBE_TAGS, AGE_RESTRICTION_OPTIONS } from '@/lib/schemas/events'

const tagOptions = VIBE_TAGS.map((tag) => ({ value: tag, label: tag }))
const ageOptions = AGE_RESTRICTION_OPTIONS.map((age) => ({
  value: age,
  label: age,
}))

type Props = {
  time: 'upcoming' | 'past'
  tags: string[]
  age: string | null
  dogs: boolean
}

export function EventFilters({ time, tags, age, dogs }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function pushParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, val] of Object.entries(updates)) {
      if (val) {
        params.set(key, val)
      } else {
        params.delete(key)
      }
    }
    const qs = params.toString()
    router.push(qs ? `/events?${qs}` : '/events')
  }

  function handleTimeChange(value: string) {
    pushParams({ time: value === 'past' ? 'past' : null })
  }

  function handleTagsChange(value: string | string[]) {
    const arr = Array.isArray(value) ? value : [value]
    pushParams({ tags: arr.length > 0 ? arr.join(',') : null })
  }

  function handleAgeChange(value: string | string[]) {
    const v = Array.isArray(value) ? value[0] : value
    pushParams({ age: v || null })
  }

  function handleDogsChange(pressed: boolean) {
    pushParams({ dogs: pressed ? 'yes' : null })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ToggleGroup
        label="Filter by time"
        options={[
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'past', label: 'Past' },
        ]}
        value={time}
        onChange={handleTimeChange}
      />
      <FilterSelect
        label="Vibes"
        options={tagOptions}
        value={tags}
        onChangeAction={handleTagsChange}
        multiple
      />
      <FilterSelect
        label="Age"
        options={ageOptions}
        value={age ?? ''}
        onChangeAction={handleAgeChange}
      />
      <ToggleChip
        label="Dogs Welcome"
        pressed={dogs}
        onChangeAction={handleDogsChange}
      >
        🐶
      </ToggleChip>
    </div>
  )
}
