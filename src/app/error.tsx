'use client'

import { useEffect } from 'react'
import { LayoutWidth } from '@/lib/constants'
import { Button } from '@/components/Button'
import { TextLink } from '@/components/TextLink'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className={LayoutWidth.wide}>
      <div className="py-16 text-center">
        <h1 className="mb-4">Something went wrong</h1>
        <p className="mb-8 text-muted">
          We hit an unexpected snag. Try refreshing, or come back in a moment.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button onClick={reset}>Try again</Button>
          <TextLink href="/">Go home</TextLink>
        </div>
      </div>
    </main>
  )
}
