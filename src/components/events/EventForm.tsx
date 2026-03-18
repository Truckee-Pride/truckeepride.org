'use client'

import { useActionState, useState, useRef, useCallback } from 'react'
import {
  createEventSchema,
  createEventBaseSchema,
  AGE_RESTRICTION_OPTIONS,
  type AgeRestriction,
  type CreateEventInput,
} from '@/lib/schemas/events'
import { useFormErrors } from '@/hooks/useFormErrors'
import type { Event } from '@/db/schema/events'
import { createEvent } from '@/app/events/new/actions'
import { Input } from '@/components/forms/Input'
import { DateInput } from '@/components/forms/DateInput'
import { MarkdownEditor } from '@/components/forms/MarkdownEditor'
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

export function EventForm({ event, action = createEvent }: Props) {
  const imageUploadRef = useRef<ImageUploadHandle>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Controlled field state — React 19 resets forms after actions complete,
  // so we use value= (not defaultValue=) to preserve input across failures.
  const [title, setTitle] = useState(event?.title ?? '')
  const [shortDescription, setShortDescription] = useState(
    event?.shortDescription ?? '',
  )
  const [locationName, setLocationName] = useState(event?.locationName ?? '')
  const [locationAddress, setLocationAddress] = useState(
    event?.locationAddress ?? '',
  )
  const [startTime, setStartTime] = useState(formatTime(event?.startTime))
  const [ageRestriction, setAgeRestriction] = useState(
    event?.ageRestriction ?? 'All ages',
  )
  const [ticketUrl, setTicketUrl] = useState(event?.ticketUrl ?? '')
  const [requiresTicket, setRequiresTicket] = useState(
    event?.requiresTicket ?? false,
  )

  // Wrap the server action to handle client-side validation and image upload
  // before handing off to the real action. This keeps everything in one action
  // flow so Next.js properly handles redirects.
  const wrappedAction: FormAction = useCallback(
    async (prev, formData) => {
      setUploadError(null)

      // Client-side validation
      const raw = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        locationName: formData.get('locationName') as string,
        locationAddress:
          (formData.get('locationAddress') as string) || undefined,
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
        return {
          success: false,
          fieldErrors: result.error.flatten().fieldErrors as Partial<
            Record<keyof CreateEventInput, string[]>
          >,
        }
      }

      // Upload image if one was selected
      if (imageUploadRef.current?.needsUpload) {
        setIsUploading(true)
        try {
          const url = await imageUploadRef.current.upload()
          formData.set('flyerUrl', url ?? '')
        } catch {
          setUploadError('Image upload failed. Please try again.')
          return prev
        } finally {
          setIsUploading(false)
        }
      }

      return action(prev, formData)
    },
    [action],
  )

  const [state, formAction, isPending] = useActionState(
    wrappedAction,
    initialState,
  )
  const { errors, onFieldChange } = useFormErrors(
    createEventBaseSchema.shape,
    state.fieldErrors,
  )

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value)
    onFieldChange('title', e.target.value)
  }
  function handleShortDescriptionChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    setShortDescription(e.target.value)
    onFieldChange('shortDescription', e.target.value)
  }
  // MDXEditor onChange gives a string directly, unlike native inputs
  function handleDescriptionChange(value: string) {
    onFieldChange('description', value)
  }
  function handleLocationNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocationName(e.target.value)
    onFieldChange('locationName', e.target.value)
  }
  function handleLocationAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocationAddress(e.target.value)
    onFieldChange('locationAddress', e.target.value)
  }
  function handleDateChange(v: string) {
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
    setAgeRestriction(e.target.value as AgeRestriction)
    onFieldChange('ageRestriction', e.target.value)
  }
  function handleTicketUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTicketUrl(e.target.value)
    onFieldChange('ticketUrl', e.target.value)
  }

  return (
    <Form action={formAction} className="mt-8 max-w-2xl space-y-6">
      <FormError message={state.error ?? uploadError ?? undefined} />

      <Input
        label="Event Title"
        name="title"
        required
        value={title}
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
        value={shortDescription}
        maxLength={500}
        placeholder="e.g. Live music, food trucks, and community fun"
        description="Shown on home page and events list. One short sentence works best."
        errors={errors.shortDescription}
        onChange={handleShortDescriptionChange}
      />

      <MarkdownEditor
        label="Description"
        name="description"
        required
        defaultValue={event?.description ?? ''}
        description="Full details about the event. Supports bold, italic, lists, links, and headings."
        errors={errors.description}
        onChangeAction={handleDescriptionChange}
      />

      <div className="grid items-start gap-6 xs:grid-cols-2">
        <Input
          label="Location Name"
          name="locationName"
          required
          value={locationName}
          maxLength={200}
          placeholder="e.g. Truckee Regional Park"
          errors={errors.locationName}
          onChange={handleLocationNameChange}
        />
        <Input
          label="Address"
          name="locationAddress"
          value={locationAddress}
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
          onChangeAction={handleDateChange}
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
        value={ageRestriction}
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
          value={ticketUrl}
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
