'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

const chevronStyles = 'size-4 text-subtle'

export function StatusFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('status') ?? ''
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const activeLabel = STATUSES.find((s) => s.value === current)?.label

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('status', value)
    } else {
      params.delete('status')
    }
    router.push(`/admin/events?${params.toString()}`)
    setOpen(false)
  }

  function handleToggle() {
    setOpen(!open)
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={handleToggle}
        className={`inline-flex cursor-pointer items-center gap-1 font-medium no-underline hover:underline ${current ? 'text-brand' : 'text-foreground'}`}
      >
        {current ? `Status: ${activeLabel}` : 'Status'}
        <span className="text-xs">
          {open ? (
            <ChevronUp aria-hidden className={chevronStyles} />
          ) : (
            <ChevronDown aria-hidden className={chevronStyles} />
          )}
        </span>
      </button>
      {open && (
        <div className="border-border bg-background absolute left-0 z-10 mt-1 min-w-[140px] rounded-lg border py-1 shadow-lg">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => handleSelect(s.value)}
              className={`hover:bg-surface block w-full cursor-pointer px-3 py-1.5 text-left text-sm ${s.value === current ? 'text-brand font-semibold' : 'text-foreground'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
