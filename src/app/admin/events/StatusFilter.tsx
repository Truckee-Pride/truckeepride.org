'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending' },
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

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('status', value)
    } else {
      params.delete('status')
    }
    router.push(`/admin/events?${params.toString()}`)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 font-medium cursor-pointer no-underline hover:underline ${current ? 'text-brand' : 'text-foreground'}`}
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
        <div className="absolute z-10 mt-1 left-0 rounded-lg border border-border bg-background shadow-lg py-1 min-w-[140px]">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => select(s.value)}
              className={`block w-full text-left px-3 py-1.5 text-sm cursor-pointer hover:bg-surface ${s.value === current ? 'font-semibold text-brand' : 'text-foreground'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
