'use client'

import { useActionState, useState } from 'react'
import {
  createEventSchema,
  AGE_RESTRICTION_OPTIONS,
  type CreateEventInput,
} from '@/lib/schemas/events'
import type { Event } from '@/db/schema/events'
import { createEvent } from '@/app/events/new/actions'
import { Input } from '@/components/forms/Input'
import { Textarea } from '@/components/forms/Textarea'
import { Select } from '@/components/forms/Select'
import { Checkbox } from '@/components/forms/Checkbox'
import { FormError } from '@/components/forms/FormError'
import { EmojiPicker } from '@/components/forms/EmojiPicker'
import { TimeCombobox } from '@/components/forms/TimeCombobox'

type ActionState = {
  success: boolean
  error?: string
  fieldErrors?: Partial<Record<keyof CreateEventInput, string[]>>
}

type FormAction = (
  prevState: ActionState,
  formData: FormData,
) => Promise<ActionState>

const initialState: ActionState = { success: false }

const ageRestrictionOptions = AGE_RESTRICTION_OPTIONS.map((opt) => ({
  value: opt,
  label: opt,
}))

type Props = {
  event?: Event
  action?: FormAction
}

export function EventForm({ event, action = createEvent }: Props) {
  const [state, formAction, isPending] = useActionState(action, initialState)
  const [clientErrors, setClientErrors] = useState<
    Partial<Record<string, string[]>>
  >({})
  const [requiresTicket, setRequiresTicket] = useState(
    event?.requiresTicket ?? false,
  )

  const errors = { ...state.fieldErrors, ...clientErrors }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget)
    const raw = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      locationName: formData.get('locationName') as string,
      locationAddress: (formData.get('locationAddress') as string) || undefined,
      date: formData.get('date') as string,
      startTime: formData.get('startTime') as string,
      endTime: (formData.get('endTime') as string) || undefined,
      flyerUrl: (formData.get('flyerUrl') as string) || undefined,
      ticketUrl: (formData.get('ticketUrl') as string) || undefined,
      shortDescription:
        (formData.get('shortDescription') as string) || undefined,
      emoji: (formData.get('emoji') as string) || undefined,
      requiresTicket: formData.get('requiresTicket') === 'on',
      ageRestriction: formData.get('ageRestriction') as string,
      dogsWelcome: formData.get('dogsWelcome') === 'on',
    }

    const result = createEventSchema.safeParse(raw)
    if (!result.success) {
      e.preventDefault()
      setClientErrors(result.error.flatten().fieldErrors)
      return
    }

    setClientErrors({})
  }

  function formatDate(date: Date | null | undefined): string {
    if (!date) return ''
    return date.toISOString().slice(0, 10)
  }

  function formatTime(date: Date | null | undefined): string {
    if (!date) return ''
    const offset = date.getTimezoneOffset()
    const local = new Date(date.getTime() - offset * 60000)
    return local.toISOString().slice(11, 16)
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="mt-8 max-w-2xl space-y-6"
    >
      <FormError message={state.error} />

      <Input
        label="Event Title"
        name="title"
        required
        defaultValue={event?.title}
        maxLength={200}
        placeholder="e.g. Pride Week Kickoff Party"
        description="The main name of your event. Keep it short and descriptive."
        errors={errors.title}
      />

      <EmojiPicker
        label="Emoji"
        name="emoji"
        defaultValue={event?.emoji ?? ''}
      />

      <Input
        label="Short Description"
        name="shortDescription"
        defaultValue={event?.shortDescription ?? ''}
        maxLength={500}
        placeholder="e.g. Live music, food trucks, and community fun"
        description="Shown on home page and events list. One short sentence works best."
        errors={errors.shortDescription}
      />

      <Textarea
        label="Description"
        name="description"
        required
        defaultValue={event?.description}
        rows={5}
        placeholder="e.g. Join us for an evening of live music and dancing at the park. All ages welcome. Bring a blanket and your best dance moves!"
        description="Full details about the event. Include what to expect, what to bring, what to wear, etc."
        errors={errors.description}
      />

      <div className="grid items-start gap-6 xs:grid-cols-2">
        <Input
          label="Location Name"
          name="locationName"
          required
          defaultValue={event?.locationName}
          maxLength={200}
          placeholder="e.g. Truckee Regional Park"
          errors={errors.locationName}
        />
        <Input
          label="Address"
          name="locationAddress"
          defaultValue={event?.locationAddress ?? ''}
          maxLength={400}
          placeholder="e.g. 10981 Truckee Way, Truckee, CA"
          errors={errors.locationAddress}
        />
      </div>

      <div className="grid items-start gap-6 xs:grid-cols-3">
        <Input
          label="Date"
          name="date"
          type="date"
          required
          defaultValue={formatDate(event?.startTime)}
          errors={errors.date}
          onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
        />
        <TimeCombobox
          label="Start Time"
          name="startTime"
          required
          defaultValue={formatTime(event?.startTime)}
          errors={errors.startTime}
        />
        <TimeCombobox
          label="End Time"
          name="endTime"
          defaultValue={formatTime(event?.endTime)}
          errors={errors.endTime}
        />
      </div>

      <Input
        label="Flyer Image URL"
        name="flyerUrl"
        type="url"
        defaultValue={event?.flyerUrl ?? ''}
        placeholder="e.g. https://imgur.com/your-flyer.jpg"
        description="Paste a link to an image. File upload coming soon."
        errors={errors.flyerUrl}
      />

      <Select
        label="Age Restriction"
        name="ageRestriction"
        required
        options={ageRestrictionOptions}
        defaultValue={event?.ageRestriction ?? 'All ages'}
        className="max-w-xs"
        description="Select if any part of the event has age requirements."
        errors={errors.ageRestriction}
      />

      <Checkbox
        label="Dogs Welcome"
        name="dogsWelcome"
        defaultChecked={event?.dogsWelcome}
        description="Let attendees know if they can bring their furry friends."
      />

      <Checkbox
        label="Requires Ticket"
        name="requiresTicket"
        defaultChecked={event?.requiresTicket}
        onChange={(e) => setRequiresTicket(e.target.checked)}
        description="Check this if attendees need a ticket or RSVP."
      />

      {requiresTicket && (
        <Input
          label="Ticket URL"
          name="ticketUrl"
          type="url"
          defaultValue={event?.ticketUrl ?? ''}
          placeholder="e.g. https://eventbrite.com/your-event"
          description="Link where attendees can buy tickets or RSVP."
          errors={errors.ticketUrl}
        />
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand px-6 py-2.5 font-semibold text-inverse transition-colors hover:bg-brand-hover disabled:opacity-50"
        >
          {isPending
            ? 'Submitting...'
            : event
              ? 'Save Changes'
              : 'Submit for Review'}
        </button>
      </div>
    </form>
  )
}
