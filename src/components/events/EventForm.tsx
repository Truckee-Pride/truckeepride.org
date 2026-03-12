'use client'

import { useActionState, useState } from 'react'
import {
  createEventSchema,
  AGE_RESTRICTION_OPTIONS,
  type CreateEventInput,
} from '@/lib/schemas/events'
import type { Event } from '@/db/schema/events'
import { Input } from '@/components/forms/Input'
import { Textarea } from '@/components/forms/Textarea'
import { Select } from '@/components/forms/Select'
import { Checkbox } from '@/components/forms/Checkbox'
import { FormError } from '@/components/forms/FormError'
import { EmojiPicker } from '@/components/forms/EmojiPicker'

type ActionState = {
  success: boolean
  error?: string
  fieldErrors?: Partial<Record<keyof CreateEventInput, string[]>>
}

const initialState: ActionState = { success: false }

// Placeholder action — replaced in Chunk 6 with real createEvent / updateEvent
async function placeholderAction(
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  return { success: false, error: 'Server action not wired up yet' }
}

const ageRestrictionOptions = AGE_RESTRICTION_OPTIONS.map((opt) => ({
  value: opt,
  label: opt,
}))

type Props = {
  event?: Event
}

export function EventForm({ event }: Props) {
  const [state, formAction, isPending] = useActionState(
    placeholderAction,
    initialState,
  )
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
      startTime: formData.get('startTime') as string,
      endTime: (formData.get('endTime') as string) || undefined,
      flyerUrl: (formData.get('flyerUrl') as string) || undefined,
      ticketUrl: (formData.get('ticketUrl') as string) || undefined,
      shortDescription:
        (formData.get('shortDescription') as string) || undefined,
      emoji: (formData.get('emoji') as string) || undefined,
      requiresTicket: formData.get('requiresTicket') === 'on',
      ageRestriction: (formData.get('ageRestriction') as string) || undefined,
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

  function formatForDatetimeLocal(date: Date | null | undefined): string {
    if (!date) return ''
    const offset = date.getTimezoneOffset()
    const local = new Date(date.getTime() - offset * 60000)
    return local.toISOString().slice(0, 16)
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="mt-6 space-y-5"
    >
      <FormError message={state.error} />

      <Input
        label="Event Title"
        name="title"
        required
        defaultValue={event?.title}
        maxLength={200}
        placeholder="Pride Week Kickoff Party"
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
        placeholder="One-line summary shown on event cards"
        errors={errors.shortDescription}
      />

      <Textarea
        label="Description"
        name="description"
        required
        defaultValue={event?.description}
        rows={5}
        placeholder="Tell people what this event is about..."
        errors={errors.description}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Location Name"
          name="locationName"
          required
          defaultValue={event?.locationName}
          maxLength={200}
          placeholder="Truckee Regional Park"
          errors={errors.locationName}
        />
        <Input
          label="Address"
          name="locationAddress"
          defaultValue={event?.locationAddress ?? ''}
          maxLength={400}
          placeholder="10981 Truckee Way, Truckee, CA"
          errors={errors.locationAddress}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Start Time"
          name="startTime"
          type="datetime-local"
          required
          defaultValue={formatForDatetimeLocal(event?.startTime)}
          errors={errors.startTime}
        />
        <Input
          label="End Time"
          name="endTime"
          type="datetime-local"
          defaultValue={formatForDatetimeLocal(event?.endTime)}
          errors={errors.endTime}
        />
      </div>

      <Input
        label="Flyer Image URL"
        name="flyerUrl"
        type="url"
        defaultValue={event?.flyerUrl ?? ''}
        placeholder="https://example.com/flyer.jpg"
        description="Paste a link to an image. File upload coming soon."
        errors={errors.flyerUrl}
      />

      <Select
        label="Age Restriction"
        name="ageRestriction"
        options={ageRestrictionOptions}
        placeholder="No restriction"
        defaultValue={event?.ageRestriction ?? ''}
        className="max-w-xs"
        errors={errors.ageRestriction}
      />

      <div className="flex flex-wrap gap-6">
        <Checkbox
          label="Requires Ticket"
          name="requiresTicket"
          defaultChecked={event?.requiresTicket}
          onChange={(e) => setRequiresTicket(e.target.checked)}
        />
        <Checkbox
          label="Dogs Welcome"
          name="dogsWelcome"
          defaultChecked={event?.dogsWelcome}
        />
      </div>

      {requiresTicket && (
        <Input
          label="Ticket URL"
          name="ticketUrl"
          type="url"
          defaultValue={event?.ticketUrl ?? ''}
          placeholder="https://tickets.example.com/event"
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
