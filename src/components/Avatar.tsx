'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  src?: string | null
  name?: string | null
  size?: number
}

function getInitials(name?: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0][0]?.toUpperCase() ?? '?'
}

const avatarStyles = cn(
  'inline-flex items-center justify-center rounded-full',
  'bg-gray-400 text-inverse text-xs font-medium',
  'shrink-0 overflow-hidden',
)

export function Avatar({ src, name, size = 32 }: Props) {
  const [failed, setFailed] = useState(false)

  function handleError() {
    setFailed(true)
  }

  const showImage = src && !failed

  return (
    <span
      className={avatarStyles}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={handleError}
        />
      ) : (
        getInitials(name)
      )}
    </span>
  )
}
