---
name: forms
description: Form submission patterns for Next.js 15 with React 19. Covers useActionState with Server Actions, the critical React 19 form reset problem (why controlled inputs are required instead of defaultValue), hidden input patterns, and Zod validation. Loaded when building or modifying forms, form components, or Server Actions that handle form data.
user-invocable: false
---

# Forms & Validation

## Form submission pattern

Use React's `useActionState` (React 19 / Next.js 15) with Server Actions for form handling — no client-side `fetch` for mutations. See `EventForm.tsx` and `AccountForm.tsx` for reference implementations.

**Never use `onSubmit` to intercept a form that calls a server action.** Wrap the server action in a client function passed to `useActionState` instead. See CLAUDE.md for details.

## React 19 form reset

React 19 automatically resets forms after any action completes (success or failure). This means **uncontrolled inputs (`defaultValue`) lose their values** after a failed submission — the user's input disappears.

**Rule: use controlled inputs (`value=` + `useState`) for any `<input>`, `<select>`, or `<textarea>` that passes its value directly to the DOM.** This is the only reliable way to preserve user input across failed submissions.

```tsx
// WRONG — input clears after failed submission
const [state, formAction] = useActionState(myAction, initialState)
return (
  <form action={formAction}>
    <Input name="title" defaultValue={event?.title} />
  </form>
)

// RIGHT — controlled input survives form reset
const [title, setTitle] = useState(event?.title ?? '')
const [state, formAction] = useActionState(myAction, initialState)
return (
  <form action={formAction}>
    <Input
      name="title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
  </form>
)
```

### Components that manage their own state

Some form components (e.g. `DateInput`, `TimeCombobox`, `MarkdownEditor`, `EmojiPicker`) use `useState` internally and only read `defaultValue` on mount. These are already safe from form reset — their internal state survives. Use `defaultValue` with these components as normal.

**If you build a new form component that manages its own state internally**, make sure any hidden `<input>` that carries the value into `FormData` uses `value=` (controlled), not `defaultValue`. Otherwise the hidden input resets to empty on form submission. See `MarkdownEditor.tsx` for the pattern.

## Validation

- Use **Zod** for all input validation — both client-side (for fast feedback) and server-side (for security).
- Define Zod schemas in a colocated `schema.ts` next to the form they validate.
- Return structured errors from Server Actions; display them inline next to the relevant field.
- Use the `useFormErrors` hook to bridge server-side field errors with client-side per-keystroke validation. See `EventForm.tsx` for the pattern.
