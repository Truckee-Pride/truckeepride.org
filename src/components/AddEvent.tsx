import { CalendarPlus } from 'lucide-react'
import { Button } from '@/components/Button'

export function AddEvent() {
  return (
    <Button href="/events/new">
      <CalendarPlus size={16} />
      Submit an Event
    </Button>
  )
}
