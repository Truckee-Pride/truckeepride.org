import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { LayoutWidth } from '@/lib/constants'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { PageHeader } from '@/components/PageHeader'
import { EventForm } from '@/components/events/EventForm'
import { updateEvent } from './actions'

export const metadata = {
  title: 'Edit Event',
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await db.query.events.findFirst({
    where: eq(events.slug, slug),
  })

  if (!event) notFound()

  const action = updateEvent.bind(null, event.id)

  return (
    <main className={LayoutWidth.wide}>
      <PageHeader title="Edit Event" />
      <EventForm event={event} action={action} />
    </main>
  )
}
