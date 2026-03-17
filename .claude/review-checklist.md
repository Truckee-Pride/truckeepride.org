# Review Checklist

Walk through every rule below for each changed file. When you find a violation,
fix it immediately before moving to the next rule. Only review changed lines
(the `+` lines in the diff), not surrounding unchanged context.

Do not flag formatting issues (Prettier handles those).

---

## Design System Components

### C1 — No bare `<button>` elements

Look for: `<button` in JSX (not inside a component definition in `src/components/`)
Fix: Replace with `<Button>` (filled action) or `<TextButton>` (inline text action).
Add import from `@/components/Button` or `@/components/TextButton`.
If it has an `href`, use `<Button href="...">`.

### C2 — No bare `<a>` or styled `<Link>`

Look for: `<a ` in JSX, or `<Link` with className/styling props
Fix: Replace with `<TextLink href="...">` for inline text links,
or `<Button href="...">` for CTA-style links.
Add import from `@/components/TextLink` or `@/components/Button`.
Plain unstyled `<Link>` wrapping a component (not text) is OK.

### C3 — No bare form elements

Look for: `<input`, `<textarea`, `<select`, `<input type="checkbox"` in JSX
(not inside component definitions in `src/components/forms/`)
Fix: Replace with the matching component from `@/components/forms/`:

- `<input>` → `<Input>` (add label, name, errors props)
- `<textarea>` → `<Textarea>`
- `<select>` → `<Select>` (convert `<option>` children to `options` prop array)
- `<input type="checkbox">` → `<Checkbox>`
- `<input type="date">` → `<DateInput>`

### C4 — No bare `<img>` elements

Look for: `<img` in JSX
Fix: Replace with `<Image>` from `next/image`. Add width/height or fill prop.

---

## Tailwind

### T1 — No template literals for className

Look for: `` className={`...`} `` or `` className={`${...}`} ``
Fix: Convert to `cn()` from `clsx`. Example:
  Before: `` className={`foo ${x ? 'bar' : ''}`} ``
  After:  `className={cn('foo', x && 'bar')}`
Add `import { cn } from '@/lib/cn'` if not present.

### T2 — Extract long className strings

Look for: className with more than ~8 utility classes inline
Fix: Extract to a named const above the return statement.
Name by what the element _is_, not what it looks like.

Before: `<div className="flex items-center gap-2 rounded-lg border p-4 shadow-sm">`
After:

```tsx
const card = 'flex items-center gap-2 rounded-lg border p-4 shadow-sm'
// ...
<div className={card}>
```

### T3 — No `!important` or Tailwind `!` prefix

Look for: `!important` in CSS, or `!` prefix on Tailwind utilities (e.g., `!mt-4`)
Fix: Remove the `!important`/`!` prefix. Fix the cascade issue in
`globals.css` by moving the conflicting style into `@layer base`.

### T4 — No arbitrary values

Look for: Square bracket values like `[42px]`, `[#abc123]`, `[200ms]`
Fix: Use the closest design token from the theme. If no token exists,
add one to `globals.css` under `@theme` and use the new token name.

### T5 — Use cva for component variants

Look for: Ternary expressions inside className choosing between style sets,
  e.g., `className={cn(intent === 'primary' ? 'bg-pink' : 'bg-red')}`
Fix: Convert to `cva()` from `class-variance-authority` with a `variants` object.
See `.claude/tailwind.md` for the full pattern.

### T6 — Group responsive/state variants

Look for: className with 3+ modifier prefixes (sm:, hover:, focus:, dark:, etc.)
  all on one line
Fix: Extract to a const using `cn()` with each group on its own line:

```tsx
const styles = cn(
  'base classes',
  'sm:responsive md:responsive',
  'hover:interactive focus:interactive',
)
```

---

## Next.js / App Router

### N1 — Unnecessary `"use client"`

Look for: `'use client'` at top of file that uses no browser APIs,
  no event handlers, no React state/effects
Fix: Remove the directive. Convert to Server Component.

### N2 — useEffect + useState for data fetching

Look for: `useEffect` calling fetch/API with results stored in `useState`
Fix: Move data fetching to a Server Component parent, pass data as props.

### N3 — API route for UI-driven mutation

Look for: `fetch('/api/...')` in form submission or button click handlers
Fix: Convert to a Server Action with `'use server'`.

### N4 — Server Action missing directive

Look for: Server Action files that don't start with `'use server'`
Fix: Add `'use server'` as the first line of the file.

### N5 — Server Action throws instead of returning error object

Look for: `throw new Error(...)` in Server Actions called by forms
Fix: Return `{ success: false, error: 'message' }` instead.

---

## TypeScript

### TS1 — Use of `any`

Look for: `: any`, `as any`, `<any>`
Fix: Replace with `unknown` and add type narrowing, or define a proper type.

### TS2 — Manual type duplication

Look for: Type definitions that duplicate Drizzle table columns or Zod schema shape
Fix: Use `typeof table.$inferSelect` for Drizzle, `z.infer<typeof schema>` for Zod.

---

## Code Style

### S1 — Inline arrow function event handler in JSX

Look for: `onClick={() => ...}`, `onChange={(e) => ...}` with multi-statement body
  (single function calls like `onClick={() => setOpen(true)}` are OK)
Fix: Extract to a named `handleX` function above the return.

### S2 — Commented-out code

Look for: Blocks of commented-out JSX, functions, or imports
Fix: Delete the commented-out code entirely.

---

## Auth & Security

### A1 — Permission check only in UI

Look for: Server Actions that modify data without calling `auth()`
  or checking user role/ownership
Fix: Add `auth()` call and role/ownership check at the start of the action.

### A2 — Hardcoded secret

Look for: API keys, tokens, passwords, connection strings in source code
Fix: Move to `.env.local` and reference via `process.env.VARIABLE_NAME`.

---

## Data Layer

### D1 — Event mutation without audit log

Look for: `db.insert`/`db.update`/`db.delete` on events table without
  corresponding audit log insert in the same transaction
Fix: Add audit log entry in the same transaction.

### D2 — Multi-step mutation without transaction

Look for: Multiple `db.*` calls that should be atomic but aren't wrapped
  in `db.transaction()`
Fix: Wrap in `db.transaction(async (tx) => { ... })`.

### D3 — Missing revalidation after mutation

Look for: Server Actions with `db.insert`/`db.update`/`db.delete`
  but no `revalidatePath()` or `revalidateTag()`
Fix: Add appropriate `revalidatePath('/events')` or similar after the mutation.

---

## Accessibility

### A11Y1 — Image without meaningful alt text

Look for: `<Image` with `alt=""` or missing `alt` prop
  (empty alt is OK only for purely decorative images)
Fix: Add descriptive alt text.

### A11Y2 — Non-semantic interactive element

Look for: `<div onClick`, `<span onClick`, `<div role="button"`
Fix: Use `<Button>` or `<TextButton>` component instead.

### A11Y3 — Missing semantic landmarks

Look for: `<div>` used where `<nav>`, `<main>`, `<article>`, `<section>`,
  `<header>`, `<footer>` would be appropriate
Fix: Replace with the appropriate semantic element.

---

## Forms

### F1 — Missing Zod validation on Server Action input

Look for: Server Actions that read `formData.get()` without Zod parsing
Fix: Add Zod schema and parse input with `.safeParse()`.

### F2 — Form using client-side fetch instead of useActionState

Look for: Forms that call `fetch()` in an onSubmit handler
Fix: Convert to `useActionState` with a Server Action.

---

## Performance

### P1 — Premature memoization

Look for: `useMemo` or `useCallback` without a documented perf reason
Fix: Remove the memoization unless there's a measured performance issue.
