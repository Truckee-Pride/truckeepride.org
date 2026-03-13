import { LayoutWidth } from '@/lib/constants'
import { PageHeader } from '@/components/PageHeader'
import { EventForm } from '@/components/events/EventForm'

export const metadata = {
  title: 'Submit Event',
}

export default function NewEventPage() {
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
