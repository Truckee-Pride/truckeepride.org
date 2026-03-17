import type { Metadata } from 'next'
import { LayoutWidth } from '@/lib/constants'
import { Button } from '@/components/Button'

export const metadata: Metadata = {
  title: 'Page Not Found',
}

export default function NotFound() {
  return (
    <main className={LayoutWidth.wide}>
      <div className="py-16 text-center">
        <h1 className="mb-4">Page not found</h1>
        <p className="mb-8 text-muted">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Button href="/">Back to home</Button>
      </div>
    </main>
  )
}
