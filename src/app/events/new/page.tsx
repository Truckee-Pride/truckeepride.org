import { LayoutWidth } from '@/lib/constants'
import { PageHeader } from '@/components/PageHeader'
import { EventForm } from '@/components/events/EventForm'
import { AccountForm } from '@/components/events/AccountForm'
import { getCurrentUser } from '@/lib/auth-stub'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit Event',
}

export default async function NewEventPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <main className={LayoutWidth.wide}>
        <PageHeader
          title="Submit Event"
          subtitle="Create an account to submit your event for review."
        />
        <AccountForm redirectTo="/events/new" />
      </main>
    )
  }

  return (
    <main className={LayoutWidth.wide}>
      <PageHeader
        title="Submit Event"
        subtitle="Fill out the details below. Your event will be reviewed before it goes live."
      />
      <EventForm />
    </main>
  )
}
