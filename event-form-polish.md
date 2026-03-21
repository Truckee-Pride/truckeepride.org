# Plan: MVP.6 — Event Form Polish

## Context

This is a Next.js 15 App Router project. Read `CLAUDE.md` before starting.

Key files for this task:

- `src/components/forms/DateInput.tsx` — segment-based date picker with DayPicker calendar
- `src/components/forms/TimeCombobox.tsx` — segment-based time picker with dropdown
- `src/components/forms/EmojiPicker.tsx` — emoji picker button
- `src/components/forms/FormField.tsx` — label/error wrapper used by all form fields
- `src/components/events/EventForm.tsx` — the main event creation/edit form
- `src/lib/schemas/events.ts` — Zod validation schema (client + server)
- `src/db/schema/events.ts` — Drizzle DB schema

**All changes in this plan are self-contained. No auth dependency.**

---

## Task 1 — Date Picker: Monospace Font Implementation

**Problem:** The three segment inputs (`MM`, `DD`, `YYYY`) use a proportional font today via the shared `segmentBase` class. This causes **layout jitter** in two scenarios:

1. **Placeholder text** (`MM`, `DD`, `YYYY`) is replaced by typed digits — different character widths cause the field to resize
2. **Digit changes** (e.g. `9` → `10`) cause surrounding UI to shift because characters have unequal widths in proportional fonts

**Fix:** Add `font-mono tabular-nums` to the `segmentBase` constant in `src/components/forms/DateInput.tsx`. This is the only change needed — all three inputs share this class already.

```tsx
// Before
const segmentBase = cn(
  'bg-transparent text-center text-base text-foreground',
  'focus:outline-none',
  'selection:bg-brand/20',
)

// After
const segmentBase = cn(
  'bg-transparent text-center text-base text-foreground font-mono tabular-nums',
  'focus:outline-none',
  'selection:bg-brand/20',
)
```

### Tailwind Notes

- `font-mono` should resolve to `var(--font-ibm-plex-mono)` — verify this is wired up in `tailwind.config.ts` under `fontFamily.mono`. If it resolves to a different font, use `font-[family-name:var(--font-ibm-plex-mono)]` instead.
- `tabular-nums` applies `font-variant-numeric: tabular-nums` as a belt-and-suspenders measure — IBM Plex Mono is already fixed-width, but this is good practice and makes intent explicit.
- The separator `<span>` elements (`/`) between segments do **not** need monospace — they are static characters and don't shift.

### Calendar Grid

Apply `tabular-nums` to the day number cells in the `DayPicker` grid for visual consistency. Add it to the `day_button` classNames entry:

```tsx
day_button: cn(
  'inline-flex size-9 items-center justify-center rounded-lg',
  'cursor-pointer text-sm text-foreground tabular-nums',
  'hover:bg-surface',
),
```

### File to Change

`src/components/forms/DateInput.tsx` — only the `segmentBase` constant and `day_button` classNames need updating.

---

## Task 2 — DateInput: dead zone between YYYY and calendar icon should have cursor + open picker

**Problem:** The gap between the YYYY input and the calendar icon button is dead space — clicking it does nothing and the cursor stays as default arrow.

**Fix in `src/components/forms/DateInput.tsx`:**

Add `cursor-pointer` to the outer flex container, and an `onClick` that opens the calendar when clicking outside the segment inputs or button:

```tsx
<div
  className={cn(
    'flex h-10 w-full cursor-pointer items-center rounded-md border border-border bg-background px-3',
    'focus-within:border-brand focus-within:ring-1 focus-within:ring-brand',
    fieldHasError && 'border-error',
  )}
  onClick={(e) => {
    if (!(e.target as HTMLElement).closest('input, button')) {
      setOpen(true)
      yearRef.current?.focus()
    }
  }}
>
```

The `closest('input, button')` guard ensures clicks on the segment inputs and the calendar button still route normally; only clicks in the gap trigger open + focus.

---

## Task 3 — DateInput: typed year not committed on Enter / click away

**Problem:** When a user types a full valid date (e.g. `03/15/2026`), hitting Enter or clicking away sometimes reverts the entry. Root cause: `revertIfInvalid` is called on blur and uses `isValidDate()`, which validates against current state. If React hasn't committed the final state update from the last keystroke before the blur callback closes over stale state, the date appears invalid and reverts.

The specific failure case: user types year digit-by-digit (`2`, `0`, `2`, `6`). After typing `202` (3 chars), `isValidDate()` returns false. If focus leaves before the `6` keystroke is processed, revert fires.

**Fix in `src/components/forms/DateInput.tsx`:**

Modify `revertIfInvalid` to not revert while the year field is mid-entry:

```tsx
function revertIfInvalid() {
  if (!month && !day && !year) return // allow fully empty
  // Year is still being typed — don't revert yet
  if (year.length > 0 && year.length < 4) return
  if (!isValidDate()) {
    setMonth(lastValid.current.month)
    setDay(lastValid.current.day)
    setYear(lastValid.current.year)
  }
}
```

This means:

- Empty fields: no revert (allowed)
- Year partially typed (1–3 digits): no revert (user is mid-entry)
- Year fully typed (4 digits) but date is invalid (e.g. Feb 30): revert to last valid
- Valid date: no revert, `hiddenValue` is computed and submitted correctly

Additionally, on **Enter**, explicitly check and commit before closing — ensures the `lastValid` ref reflects the current state:

```tsx
if (e.key === 'Enter') {
  e.preventDefault()
  // Commit current state as valid if it passes validation
  if (isValidDate()) {
    lastValid.current = { month, day, year }
  }
  setOpen(false)
  return
}
```

This is only a safeguard — `lastValid.current` is already updated on render when `isValidDate()` is true, but the explicit commit on Enter removes any ambiguity.

---

## Task 4 — End Time: add a clear button

**Design decision (resolved): "Clear" TextButton right-aligned with the label, visible only when a value is set.** Matches the existing EmojiPicker `Clear` pattern in this codebase. Requires adding a `labelAction` slot to `FormField`.

### Step 1 — Add `labelAction` to `FormField` (`src/components/forms/FormField.tsx`)

Add an optional `labelAction` prop that renders right-aligned next to the label:

```tsx
type Props = {
  label: string
  name: string
  required?: boolean
  description?: string
  errors?: string[]
  labelAction?: React.ReactNode // add this
  children: (fieldProps: FieldProps) => React.ReactNode
}
```

Update the label row to be `flex items-baseline justify-between` when `labelAction` is present:

```tsx
<div className="mb-1">
  <div className="flex items-baseline justify-between">
    <label htmlFor={inputId} className={labelStyles}>
      {label}
      {!required && (
        <span className="text-muted ml-1.5 text-base font-normal">
          (optional)
        </span>
      )}
    </label>
    {labelAction}
  </div>
  {description && (
    <p id={descId} className={`${descriptionStyles} -mt-1`}>
      {description}
    </p>
  )}
</div>
```

### Step 2 — Add `clearable` prop to `TimeCombobox` (`src/components/forms/TimeCombobox.tsx`)

Add to the Props type:

```tsx
clearable?: boolean
```

Inside the component, define a named handler and pass a `labelAction` to `FormField` when the field has a value and `clearable` is true:

```tsx
import { TextButton } from '@/components/TextButton'

// Named handler for clearing the time value:
function handleClearEndTime() {
  setIsEmpty(true)
  setHour(12)
  setMinute(0)
  setPeriod('PM')
}

// In the render, compute:
const showClear = clearable && !isEmpty

// Pass to FormField:
<FormField
  label={label}
  name={name}
  required={required}
  description={description}
  errors={errors}
  labelAction={
    showClear ? (
      <TextButton
        type="button"
        intent="danger"
        onClick={handleClearEndTime}
      >
        Clear
      </TextButton>
    ) : undefined
  }
>
```

### Step 3 — Use `clearable` on End Time in `EventForm` (`src/components/events/EventForm.tsx`)

```tsx
<TimeCombobox
  label="End Time"
  name="endTime"
  clearable
  defaultValue={formatTime(event?.endTime)}
  errors={errors.endTime}
  referenceTime={startTime || undefined}
/>
```

No other `TimeCombobox` usages need `clearable` — Start Time is required.

---

## Task 5 — Emoji required: schema + form update

### Step 1 — Update Zod schema (`src/lib/schemas/events.ts`)

```tsx
// Before:
emoji: z.string().max(10).optional(),

// After:
emoji: z.string().min(1, 'Please pick an emoji').max(10),
```

Both `createEventSchema` and `updateEventSchema` are the same alias, so this covers both.

### Step 2 — Update EmojiPicker to support errors (`src/components/forms/EmojiPicker.tsx`)

Add `errors` and `required` props, pass errors through to FormField, remove the `Clear` button (emoji is now required):

```tsx
type Props = {
  name: string
  label: string
  defaultValue?: string
  errors?: string[]  // add
  required?: boolean // add
}

export function EmojiPicker({ name, label, defaultValue = '', errors, required }: Props) {
```

Update the `FormField` call to pass `required` and `errors`:

```tsx
<FormField label={label} name={name} required={required} errors={errors}>
```

Remove the `{emoji && <TextButton ...>Clear</TextButton>}` block entirely — emoji is required, there's nothing to clear. (The user can always pick a different emoji by clicking the button again.)

The picker button placeholder should still show `🏳️‍🌈` when no emoji is selected to give a visual hint of what the field is.

### Step 3 — Update EventForm to pass errors and required to EmojiPicker

```tsx
<EmojiPicker
  label="Emoji"
  name="emoji"
  required
  defaultValue={event?.emoji ?? ''}
  errors={errors.emoji}
/>
```

### Step 4 — DB schema: no migration needed

`emoji text('emoji')` stays nullable in the DB — existing events with `null` emoji are unaffected. The Zod validation enforces the requirement only at form submission time.

---

## Task 6 — Short description: required with min/max length

**Decision from TODOLIST:** "Submit event short description either needs to be required (with min and max length) OR we LLM generate them. they're very helpful for SEO and for presenting the calendar on the homepage"

**This plan implements: required with min/max.** (LLM generation can be added later as an enhancement if desired — it would fill in the field automatically and the user could edit.)

### Zod schema (`src/lib/schemas/events.ts`)

```tsx
// Before:
shortDescription: z.string().max(500).optional(),

// After:
shortDescription: z
  .string()
  .min(10, 'Please add a short description (10–150 characters)')
  .max(150, 'Short description must be 150 characters or fewer'),
```

Max length reduced from 500 → 150. This is "one short sentence" as the placeholder already suggests. Update the `maxLength` prop in EventForm to match:

```tsx
<Input
  label="Short Description"
  name="shortDescription"
  required
  maxLength={150}  // was 500
  ...
  errors={errors.shortDescription}
/>
```

### Update EventForm `handleSubmit` to include `shortDescription` as required

In the `raw` object, change:

```tsx
// Before:
shortDescription: (formData.get('shortDescription') as string) || undefined,

// After:
shortDescription: formData.get('shortDescription') as string,
```

---

## Task 7 — Vibe Tags: multi-select checkboxes on event form

**Requires a DB schema change and migration.**

### Step 1 — DB schema (`src/db/schema/events.ts`)

Add a text array column for vibe tags:

```tsx
import { text, ... } from 'drizzle-orm/pg-core'

// Add to events table:
vibeTags: text('vibe_tags').array().default([]).notNull(),
```

### Step 2 — Generate and run migration

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Step 3 — Zod schema (`src/lib/schemas/events.ts`)

```tsx
export const VIBE_TAGS = ['Sporty', 'Crafty', 'Family Focused', 'Smarty Pants', "Let's Dance"] as const
export type VibeTag = (typeof VIBE_TAGS)[number]

// In createEventSchema:
vibeTags: z.array(z.enum(VIBE_TAGS)).default([]),
```

### Step 4 — Form UI in EventForm (`src/components/events/EventForm.tsx`)

Add a vibe tags section after the emoji picker, before short description. Use existing `Checkbox` components (one per tag):

```tsx
import { VIBE_TAGS } from '@/lib/schemas/events'

// Parse defaultValue from existing event
const defaultVibeTags = new Set(event?.vibeTags ?? [])

// In the form JSX, after EmojiPicker:
<fieldset>
  <legend className="text-base font-semibold text-foreground">
    Vibe Tags
    <span className="ml-1.5 text-base font-normal text-muted">(optional)</span>
  </legend>
  <p className="mt-1 text-sm text-muted">Pick any that fit your event.</p>
  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
    {VIBE_TAGS.map((tag) => (
      <Checkbox
        key={tag}
        label={tag}
        name="vibeTags"
        value={tag}
        defaultChecked={defaultVibeTags.has(tag)}
      />
    ))}
  </div>
</fieldset>
```

Note: Multiple checkboxes with the same `name="vibeTags"` will produce multiple FormData entries with the same key. Update the `handleSubmit` raw extraction:

```tsx
vibeTags: formData.getAll('vibeTags') as string[],
```

### Step 5 — Check Checkbox component supports `value` prop

Look at `src/components/forms/Checkbox.tsx`. If it doesn't accept a `value` prop, add one (passed through to the underlying `<input>`). Also check that it doesn't generate a `FormField` with conflicting IDs when the same `name` is used multiple times — may need to use `id={`field-vibeTags-${tag}`}` instead of the default `field-${name}`.

### Step 6 — Update server actions

In `src/app/events/new/actions.ts` and `src/app/events/[slug]/edit/actions.ts`, extract `vibeTags`:

```tsx
vibeTags: formData.getAll('vibeTags') as string[],
```

And include in the Drizzle insert/update.

---

## Verification steps

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Manual checks (`pnpm dev`):

1. **Date clipping**: Resize browser to ~500px wide → Date field should show full MM/DD/YYYY + calendar icon with no clipping.
2. **Dead zone cursor**: Hover over the gap right of YYYY in the date field → cursor should be pointer. Click it → calendar opens.
3. **Year entry on Enter**: Type a full date (e.g. 03/15/2026) digit by digit, press Enter → fields retain the typed values, hidden input has correct value.
4. **Year entry on click away**: Same as above but click outside the field instead of Enter.
5. **End time clear**: Set an end time, verify "Clear" TextButton appears next to label. Click Clear → field reverts to empty/placeholder.
6. **Emoji required**: Try submitting the form without picking an emoji → "Please pick an emoji" error shown. Pick one → error clears on resubmit.
7. **Short description required**: Try submitting without short description → error shown. Type fewer than 10 chars → error shown. Type 10–150 chars → passes.
8. **Vibe tags**: Pick one or more tags, submit → tags saved to DB. Open edit form → selected tags are pre-checked.

## Done

Delete these items from `TODOLIST.md` when all verification steps pass:

- All MVP.6 Event Form Polish items
