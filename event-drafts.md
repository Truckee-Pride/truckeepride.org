# Plan: Save event form draft to localStorage

## Context

When creating a new event, refreshing the page loses all form input. We'll persist a draft to localStorage so the form survives refreshes. Only applies to **new** events (not editing existing ones).

## Approach

### 1. Create `src/hooks/useDraft.ts`

A small hook that:

- Reads from localStorage **synchronously** in a `useState` initializer (so draft values are available before first render)
- Provides `updateDraft(field, value)` — writes the full draft object to localStorage on each call
- Provides `clearDraft()` — removes the key
- Takes `enabled: boolean` to no-op when editing an existing event

### 2. Integrate into `EventForm.tsx`

**Initialize from draft** — use draft values as fallbacks for all initial state:

```tsx
const { draft, updateDraft, clearDraft } = useDraft<EventDraft>(
  'event-draft',
  !event,
)

const [title, setTitle] = useState(draft.title ?? event?.title ?? '')
// ...same for shortDescription, locationName, locationAddress, startTime, ageRestriction, ticketUrl, requiresTicket
```

For self-managing components (EmojiPicker, MarkdownEditor, DateInput, TimeCombobox), pass `draft.fieldName ?? event?.fieldName ?? ''` as `defaultValue` — they read it only on mount, which is fine.

**Save on changes** — each existing `handleXChange` handler already fires on every change. Add `updateDraft('field', value)` calls alongside the existing `onFieldChange` calls. For vibeTags and dogsWelcome (currently uncontrolled), add controlled state + onChange handlers so changes are captured.

**Clear on submit** — call `clearDraft()` right before `return action(prev, formData)` in `wrappedAction`. If the action succeeds and redirects, the draft is gone. If it fails, form state is preserved in React and the next keystroke re-saves the draft.

### 3. Make vibeTags and dogsWelcome controlled

Currently these are uncontrolled (`defaultChecked`). Convert to controlled (`checked` + `onChange`) so their values can be saved to the draft. The Checkbox component already spreads `...rest`, so `checked` and `onChange` work without modifying it.

## Files to modify

- **New**: `src/hooks/useDraft.ts`
- **Edit**: `src/components/events/EventForm.tsx`

## Verification

1. `pnpm typecheck && pnpm lint`
2. Open `/events/new`, fill in several fields, refresh — fields should be restored
3. Submit the form successfully — draft should be cleared from localStorage
4. Open edit form for existing event — should NOT load any draft data
