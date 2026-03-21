'use client'

import { useActionState, useState, useRef, useCallback } from 'react'
import {
  createEventSchema,
  createEventBaseSchema,
  AGE_RESTRICTION_OPTIONS,
  type AgeRestriction,
  VIBE_TAGS,
  type CreateEventInput,
} from '@/lib/schemas/events'
import { useFormErrors } from '@/hooks/useFormErrors'
import { useDraft } from '@/hooks/useDraft'
import type { Event } from '@/db/schema/events'
import { createEvent } from '@/app/events/new/actions'
import { Input } from '@/components/forms/Input'
import { UrlInput } from '@/components/forms/UrlInput'
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
import { formatPacificDate, formatPacificTime } from '@/lib/timezone'

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
  return formatPacificDate(date)
}

function formatTime(date: Date | null | undefined): string {
  if (!date) return ''
  return formatPacificTime(date)
}

type EventDraft = {
  title: string
  shortDescription: string
  description: string
  emoji: string
  locationName: string
  locationAddress: string
  date: string
  startTime: string
  endTime: string
  ageRestriction: string
  ticketUrl: string
  requiresTicket: boolean
  dogsWelcome: boolean
  vibeTags: string[]
}

export function EventForm({ event, action = createEvent }: Props) {
  const imageUploadRef = useRef<ImageUploadHandle>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { draft, updateDraft, clearDraft } = useDraft<EventDraft>(
    'event-draft',
    !event,
  )

  // Controlled field state — React 19 resets forms after actions complete,
  // so we use value= (not defaultValue=) to preserve input across failures.
  const [title, setTitle] = useState(draft.title ?? event?.title ?? '')
  const [shortDescription, setShortDescription] = useState(
    draft.shortDescription ?? event?.shortDescription ?? '',
  )
  const [locationName, setLocationName] = useState(
    draft.locationName ?? event?.locationName ?? '',
  )
  const [locationAddress, setLocationAddress] = useState(
    draft.locationAddress ?? event?.locationAddress ?? '',
  )
  const [date, setDate] = useState(
    draft.date ?? formatDate(event?.startTime),
  )
  const [startTime, setStartTime] = useState(
    draft.startTime ?? formatTime(event?.startTime),
  )
  const [ageRestriction, setAgeRestriction] = useState(
    draft.ageRestriction ?? event?.ageRestriction ?? 'All ages',
  )
  const [ticketUrl, setTicketUrl] = useState(
    draft.ticketUrl ?? event?.ticketUrl ?? '',
  )
  const [requiresTicket, setRequiresTicket] = useState(
    draft.requiresTicket ?? event?.requiresTicket ?? false,
  )
  const [dogsWelcome, setDogsWelcome] = useState(
    draft.dogsWelcome ?? event?.dogsWelcome ?? false,
  )
  const [vibeTags, setVibeTags] = useState<Set<string>>(
    () => new Set(draft.vibeTags ?? event?.vibeTags ?? []),
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
        shortDescription: (formData.get('shortDescription') as string) ?? '',
        emoji: (formData.get('emoji') as string) ?? '',
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

      clearDraft()
      return action(prev, formData)
    },
    [action, clearDraft],
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
    updateDraft('title', e.target.value)
  }
  function handleShortDescriptionChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    setShortDescription(e.target.value)
    onFieldChange('shortDescription', e.target.value)
    updateDraft('shortDescription', e.target.value)
  }
  // MDXEditor onChange gives a string directly, unlike native inputs
  function handleDescriptionChange(value: string) {
    onFieldChange('description', value)
    updateDraft('description', value)
  }
  function handleLocationNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocationName(e.target.value)
    onFieldChange('locationName', e.target.value)
    updateDraft('locationName', e.target.value)
  }
  function handleLocationAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocationAddress(e.target.value)
    onFieldChange('locationAddress', e.target.value)
    updateDraft('locationAddress', e.target.value)
  }
  function handleDateChange(v: string) {
    setDate(v)
    onFieldChange('date', v)
    updateDraft('date', v)
  }
  function handleStartTimeChange(v: string) {
    setStartTime(v)
    onFieldChange('startTime', v)
    updateDraft('startTime', v)
  }
  function handleEndTimeChange(v: string) {
    onFieldChange('endTime', v)
    updateDraft('endTime', v)
  }
  function handleAgeRestrictionChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setAgeRestriction(e.target.value as AgeRestriction)
    onFieldChange('ageRestriction', e.target.value)
    updateDraft('ageRestriction', e.target.value)
  }
  function handleTicketUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTicketUrl(e.target.value)
    onFieldChange('ticketUrl', e.target.value)
    updateDraft('ticketUrl', e.target.value)
  }
  function handleEmojiChange(v: string) {
    onFieldChange('emoji', v)
    updateDraft('emoji', v)
  }
  function handleVibeTagChange(tag: string, checked: boolean) {
    setVibeTags((prev) => {
      const next = new Set(prev)
      if (checked) next.add(tag)
      else next.delete(tag)
      updateDraft('vibeTags', [...next])
      return next
    })
  }
  function handleDogsWelcomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDogsWelcome(e.target.checked)
    updateDraft('dogsWelcome', e.target.checked)
  }
  function handleRequiresTicketChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRequiresTicket(e.target.checked)
    updateDraft('requiresTicket', e.target.checked)
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
        required
        defaultValue={draft.emoji ?? event?.emoji ?? ''}
        errors={errors.emoji}
        onChangeAction={handleEmojiChange}
      />

      <fieldset>
        <legend className="text-base font-semibold text-foreground">
          Vibe Tags
          <span className="ml-1.5 text-base font-normal text-muted">
            (optional)
          </span>
        </legend>
        <p className="mt-1 text-sm text-muted">Pick any that fit your event.</p>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
          {VIBE_TAGS.map((tag) => (
            <Checkbox
              key={tag}
              label={tag}
              name="vibeTags"
              value={tag}
              checked={vibeTags.has(tag)}
              onChange={(e) => handleVibeTagChange(tag, e.target.checked)}
            />
          ))}
        </div>
      </fieldset>

      <Input
        label="Short Description"
        name="shortDescription"
        required
        value={shortDescription}
        maxLength={150}
        placeholder="e.g. Live music, food trucks, and community fun"
        description="Shown on home page and events list. One short sentence works best."
        errors={errors.shortDescription}
        onChange={handleShortDescriptionChange}
      />

      <MarkdownEditor
        label="Description"
        name="description"
        required
        defaultValue={draft.description ?? event?.description ?? ''}
        description="Full details about the event. Supports bold, italic, lists, links, and headings."
        errors={errors.description}
        onChangeAction={handleDescriptionChange}
      />

      <div className="grid items-start gap-6 xs:grid-cols-2">
        <Input
          label="Location Name"
          name="locationName"
          required
          autoComplete="off"
          data-1p-ignore
          data-bwignore
          data-lpignore="true"
          data-form-type="other"
          value={locationName}
          maxLength={200}
          placeholder="e.g. Truckee Regional Park"
          errors={errors.locationName}
          onChange={handleLocationNameChange}
        />
        <Input
          label="Address"
          name="locationAddress"
          autoComplete="off"
          data-1p-ignore
          data-bwignore
          data-lpignore="true"
          data-form-type="other"
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
          value={date}
          errors={errors.date}
          onChangeAction={handleDateChange}
        />
        <TimeCombobox
          label="Start Time"
          name="startTime"
          required
          defaultValue={draft.startTime ?? formatTime(event?.startTime)}
          errors={errors.startTime}
          onChange={handleStartTimeChange}
        />
        <TimeCombobox
          label="End Time"
          name="endTime"
          clearable
          defaultValue={draft.endTime ?? formatTime(event?.endTime)}
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
        checked={dogsWelcome}
        onChange={handleDogsWelcomeChange}
        description="Let attendees know if they can bring their furry friends."
      />

      <Checkbox
        label="Requires Ticket"
        name="requiresTicket"
        checked={requiresTicket}
        onChange={handleRequiresTicketChange}
        description="Check this if attendees need a ticket or RSVP."
      />

      {requiresTicket && (
        <UrlInput
          label="Ticket URL"
          name="ticketUrl"
          value={ticketUrl}
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
