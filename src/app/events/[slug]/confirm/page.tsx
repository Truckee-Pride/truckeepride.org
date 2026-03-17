import { eq } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutWidth } from '@/lib/constants'
import { requireUser } from '@/lib/auth-stub'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { EventPreview } from '@/components/events/EventPreview'
import { ConfirmSubmitButton } from './ConfirmSubmitButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confirm Event Submission',
}

export default async function ConfirmEventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const user = await requireUser()
  const { slug } = await params

  const event = await db.query.events.findFirst({
    where: eq(events.slug, slug),
  })

  if (!event) notFound()

  // Only the owner can access the confirmation page
  if (event.ownerId !== user.id && user.role !== 'admin') notFound()

  // If not a draft, redirect to the event page
  if (event.status !== 'draft') {
    redirect(`/events/${event.slug}`)
  }

  return (
    <main className={LayoutWidth.prose}>
      <div className="bg-green-50 border border-green-400 text-green-800 rounded-lg px-4 py-3 mb-6">
        <strong>Your event was saved!</strong> Review it below, then submit for
        approval.
      </div>

      <EventPreview event={event} />

      <div className="flex flex-wrap gap-3 mt-8">
        <ConfirmSubmitButton eventId={event.id} />
        <Link
          href={`/events/${event.slug}/edit`}
          className="inline-block px-6 py-3 rounded-lg font-semibold text-xl border border-border text-foreground no-underline hover:bg-gray-50 transition-colors"
        >
          Edit Event
        </Link>
      </div>
    </main>
  )
}
