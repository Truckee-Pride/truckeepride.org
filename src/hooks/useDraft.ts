'use client'

import { useCallback, useRef } from 'react'

function readDraft<T>(key: string, enabled: boolean): Partial<T> {
  if (!enabled || typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as Partial<T>) : {}
  } catch {
    return {}
  }
}

/**
 * Persists a draft object to localStorage. Reads synchronously in the
 * initializer so values are available before first paint.
 *
 * Pass `enabled: false` (e.g. when editing an existing event) to no-op
 * all operations and return an empty draft.
 */
export function useDraft<T extends Record<string, unknown>>(
  key: string,
  enabled: boolean,
): {
  draft: Partial<T>
  updateDraft: (field: keyof T, value: T[keyof T]) => void
  clearDraft: () => void
} {
  // Read once, synchronously, so callers can use it in useState initializers.
  // useRef doesn't accept a function initializer, but this only runs once per
  // mount because React re-uses the ref across re-renders.
  const draftRef = useRef<Partial<T>>(readDraft<T>(key, enabled))

  const updateDraft = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      if (!enabled) return
      try {
        const current = JSON.parse(
          localStorage.getItem(key) ?? '{}',
        ) as Partial<T>
        current[field] = value
        localStorage.setItem(key, JSON.stringify(current))
      } catch {
        // localStorage full or unavailable — silently ignore
      }
    },
    [key, enabled],
  )

  const clearDraft = useCallback(() => {
    if (!enabled) return
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
  }, [key, enabled])

  return { draft: draftRef.current, updateDraft, clearDraft }
}
