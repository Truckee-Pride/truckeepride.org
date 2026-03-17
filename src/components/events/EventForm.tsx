'use client'

import { useActionState, useState, useRef } from 'react'
import {
  createEventSchema,
  createEventBaseSchema,
  AGE_RESTRICTION_OPTIONS,
  type CreateEventInput,
} from '@/lib/schemas/events'
import { useFormErrors } from '@/hooks/useFormErrors'
import type { Event } from '@/db/schema/events'
import { createEvent } from '@/app/events/new/actions'
import { Input } from '@/components/forms/Input'
import { DateInput } from '@/components/forms/DateInput'
import { Textarea } from '@/components/forms/Textarea'
import { Select } from '@/components/forms/Select'
import { Checkbox } from '@/components/forms/Checkbox'
import { FormError } from '@/components/forms/FormError'
import { EmojiPicker } from '@/components/forms/EmojiPicker'
import { TimeCombobox } from '@/components/forms/TimeCombobox'
import {
  ImageUpload,
  type ImageUploadHandle,
} from '@/components/forms/ImageUpload'
import { Button } from '@/components/Button'
import { Form } from '@/components/forms/Form'

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
  const { errors, onFieldChange, setLocalErrors } = useFormErrors(
    createEventBaseSchema.shape,
    state.fieldErrors,
  )
  const [requiresTicket, setRequiresTicket] = useState(
    event?.requiresTicket ?? false,
  )
  const [isUploading, setIsUploading] = useState(false)
  const imageUploadRef = useRef<ImageUploadHandle>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const skipValidationRef = useRef(false)
  const [startTime, setStartTime] = useState(() => {
    const d = event?.startTime
    if (!d) return ''
    const offset = d.getTimezoneOffset()
    return new Date(d.getTime() - offset * 60000).toISOString().slice(11, 16)
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Second pass after upload — let the form action proceed
    if (skipValidationRef.current) {
      skipValidationRef.current = false
      return
    }

    e.preventDefault()

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
      setLocalErrors(result.error.flatten().fieldErrors)
      return
    }

    setLocalErrors({})

    // Upload image if one was selected
    if (imageUploadRef.current?.needsUpload) {
      setIsUploading(true)
      try {
        const url = await imageUploadRef.current.upload()
        // Manually update the hidden input — React state won't re-render
        // before requestSubmit fires below
        const hidden = formRef.current?.querySelector<HTMLInputElement>(
          'input[name="flyerUrl"]',
        )
        if (hidden) hidden.value = url ?? ''
      } catch {
        setLocalErrors({
          flyerUrl: ['Image upload failed. Please try again.'],
        })
        return
      } finally {
        setIsUploading(false)
      }
    }

    // Programmatically submit — requestSubmit re-triggers onSubmit,
    // so set flag to skip validation on the second pass
    skipValidationRef.current = true
    formRef.current?.requestSubmit()
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFieldChange('title', e.target.value)
  }
  function handleShortDescriptionChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    onFieldChange('shortDescription', e.target.value)
  }
  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onFieldChange('description', e.target.value)
  }
  function handleLocationNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFieldChange('locationName', e.target.value)
  }
  function handleLocationAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFieldChange('locationAddress', e.target.value)
  }
  function handleDateChangeAction(v: string) {
    onFieldChange('date', v)
  }
  function handleStartTimeChange(v: string) {
    setStartTime(v)
    onFieldChange('startTime', v)
  }
  function handleEndTimeChange(v: string) {
    onFieldChange('endTime', v)
  }
  function handleAgeRestrictionChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onFieldChange('ageRestriction', e.target.value)
  }
  function handleTicketUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFieldChange('ticketUrl', e.target.value)
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
    <Form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
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
        onChange={handleTitleChange}
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
        onChange={handleShortDescriptionChange}
      />

      <Textarea
        label="Description"
        name="description"
        required
        defaultValue={event?.description}
        maxLength={5000}
        rows={5}
        placeholder="e.g. Join us for an evening of live music and dancing at the park. All ages welcome. Bring a blanket and your best dance moves!"
        description="Full details about the event. Include what to expect, what to bring, what to wear, etc."
        errors={errors.description}
        onChange={handleDescriptionChange}
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
          onChange={handleLocationNameChange}
        />
        <Input
          label="Address"
          name="locationAddress"
          defaultValue={event?.locationAddress ?? ''}
          maxLength={400}
          placeholder="e.g. 10981 Truckee Way, Truckee, CA"
          errors={errors.locationAddress}
          onChange={handleLocationAddressChange}
        />
      </div>

      <div className="grid items-start gap-6 xs:grid-cols-3">
        <DateInput
          label="Date"
          name="date"
          required
          defaultValue={formatDate(event?.startTime)}
          errors={errors.date}
          onChangeAction={handleDateChangeAction}
        />
        <TimeCombobox
          label="Start Time"
          name="startTime"
          required
          defaultValue={formatTime(event?.startTime)}
          errors={errors.startTime}
          onChange={handleStartTimeChange}
        />
        <TimeCombobox
          label="End Time"
          name="endTime"
          defaultValue={formatTime(event?.endTime)}
          errors={errors.endTime}
          referenceTime={startTime || undefined}
          onChange={handleEndTimeChange}
        />
      </div>

      <ImageUpload
        ref={imageUploadRef}
        name="flyerUrl"
        label="Flyer Image"
        existingUrl={event?.flyerUrl}
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
        onChange={handleAgeRestrictionChange}
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
          onChange={handleTicketUrlChange}
        />
      )}

      <div className="pt-2">
        <Button type="submit" disabled={isPending || isUploading}>
          {isUploading
            ? 'Uploading Image...'
            : isPending
              ? 'Submitting...'
              : event
                ? 'Save Changes'
                : 'Preview & Submit'}
        </Button>
      </div>
    </Form>
  )
}
