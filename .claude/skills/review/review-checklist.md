# Review Checklist

Walk through every rule below for each changed file. When you find a violation,
fix it immediately before moving to the next rule. Only review changed lines
(the `+` lines in the diff), not surrounding unchanged context.

Do not flag formatting issues (Prettier handles those).

---

## Design System Components

### C1 — No bare `<button>` elements

Look for: `<button` in JSX
Exception: allowed in `src/components/` files that are clearly the design system wrapper for `<button>` — i.e., the filename is `Button.tsx`, `TextButton.tsx`, or similar. Any other file, including other components in `src/components/`, must use `<Button>` or `<TextButton>`.
Fix: Replace with `<Button>` (filled action) or `<TextButton>` (inline text action).
Add import from `@/components/Button` or `@/components/TextButton`.
If it has an `href`, use `<Button href="...">`.

### C2 — No bare `<a>` or styled `<Link>`

Look for: `<a ` in JSX, or `<Link` with className/styling props
Exception: allowed in `src/components/` files that are clearly the design system wrapper for `<a>` — i.e., the filename is `TextLink.tsx`, `Button.tsx` (when rendering as a link), or similar.
Fix: Replace with `<TextLink href="...">` for inline text links,
or `<Button href="...">` for CTA-style links.
Add import from `@/components/TextLink` or `@/components/Button`.
Plain unstyled `<Link>` wrapping a component (not text) is OK.

### C3 — No bare form elements

Look for: `<input`, `<textarea`, `<select`, `<input type="checkbox"` in JSX
Exception: allowed in `src/components/forms/` files that are clearly the design system wrapper for that element — i.e., `Input.tsx` may use `<input>`, `Textarea.tsx` may use `<textarea>`, etc. Any other file must use the component.
Fix: Replace with the matching component from `@/components/forms/`:

- `<input>` → `<Input>` (add label, name, errors props)
- `<textarea>` → `<Textarea>`
- `<select>` → `<Select>` (convert `<option>` children to `options` prop array)
- `<input type="checkbox">` → `<Checkbox>`
- `<input type="date">` → `<DateInput>`

### C4 — No bare `<img>` elements

Look for: `<img` in JSX
Fix: Replace with `<Image>` from `next/image`. Add width/height or fill prop.

### C5 - Use <PageHeader> instead of <h1> at the top of a page.

Look for: <h1> at or near the top of a component. Only apply this rule if the <h1> would be the first <h1> on its page.
Fix: Replace with <PageHeader> and use the `subtitle` prop if there's an adjacent paragraph below the <h1> that looks like a description or explanation of the page.

---

## Tailwind

### T1 — No template literals for className

Look for: ``className={`...`}`` or ``className={`${...}`}``
Fix: Convert to `cn()` from `clsx`. Example:
Before: ``className={`foo ${x ? 'bar' : ''}`}``
After: `className={cn('foo', x && 'bar')}`
Add `import { cn } from '@/lib/cn'` if not present.

### T2 — Extract long className strings

Look for: className with more than 4 utility classes inline
Fix: Extract to a named `*Styles` const above the return statement.
Name by what the element _is_, not what it looks like.
Use an array with `cn()` so each logical group is on its own line (easier to diff).

Before: `<div className="flex items-center gap-2 rounded-lg border p-4 shadow-sm">`
After:

```tsx
const cardStyles = cn(
  'flex items-center gap-2',
  'rounded-lg border',
  'p-4 shadow-sm',
)
// ...
<div className={cardStyles}>
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
See the `tailwind` skill for the full pattern.

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

### T7 — Admin tables must use shared table styles

Look for: Inline table classNames in `src/app/admin/` files — e.g.
`className="overflow-x-auto rounded-lg border border-border"` on a table wrapper,
or `className="px-4 py-3 font-medium"` on `<th>` / `<td>` elements.
Fix: Import and use the named consts from `src/app/admin/table-styles.ts`:

```tsx
import {
  tableWrapperStyles,
  headerRowStyles,
  bodyRowStyles,
  thStyles,
  tdStyles,
  tdMutedStyles,
  actionCellStyles,
} from '../table-styles'
```

Use `cn(thStyles, 'text-right text-muted')` to extend a base style for a
specific cell.

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

### N6 — Hydration mismatch sources

Look for: `Date.now()`, `new Date()`, `Math.random()`, or `window.*` used
directly in Server Component render output
Fix: Move to a Client Component, or use `Suspense` with a client-only wrapper.

---

## TypeScript

### TS1 — Use of `any`

Look for: `: any`, `as any`, `<any>`
(ESLint also catches this — only flag if ESLint is suppressed with a disable comment)
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

### A3 — No dangerouslySetInnerHTML without sanitization

Look for: `dangerouslySetInnerHTML` in JSX
Fix: Remove it entirely and use React's built-in escaping. If raw HTML is
truly required (e.g., rendering Markdown output), sanitize with DOMPurify
before passing to `dangerouslySetInnerHTML`.

### A4 — No secrets in NEXT*PUBLIC* env vars

Look for: `NEXT_PUBLIC_` env vars containing API keys, database URLs,
or auth secrets — either in `.env*` files or `process.env.NEXT_PUBLIC_*`
references to values that should be server-only.
Fix: Remove the `NEXT_PUBLIC_` prefix. Use the variable only in Server
Components or Server Actions.

### A5 — No force-unwrapped env vars

Look for: `process.env.VARIABLE_NAME!` (non-null assertion on env vars)
Fix: Add a runtime check or use a validated env schema. Example:
`const dbUrl = process.env.DATABASE_URL ?? ''` with an early error if empty.

### A6 — Auth check uses client-supplied userId

Look for: Server Actions that read `userId` from `formData` instead of `auth()`
Fix: Always get the user ID from `const session = await auth()` — never trust
client-supplied identity.

---

## Data Layer

### D1 — Multi-step mutation without transaction

Look for: Multiple `db.*` calls that should be atomic but aren't wrapped
in `db.transaction()`
Fix: Wrap in `db.transaction(async (tx) => { ... })`.

### D2 — Missing revalidation after mutation

Look for: Server Actions with `db.insert`/`db.update`/`db.delete`
but no `revalidatePath()` or `revalidateTag()`
Fix: Add appropriate `revalidatePath('/events')` or similar after the mutation.

### D3 — No string interpolation in SQL

Look for: Template literals building SQL strings with `${variable}` that
bypass Drizzle's parameterized query builders.
Fix: Use Drizzle's query builder API or `sql.placeholder()` for dynamic values.

### D4 — Drizzle N+1 queries

Look for: `db.query.*` or `db.select()` calls inside a `.map()`, `.forEach()`,
or `for` loop
Fix: Use a single query with `inArray()` or a relational `with` clause.

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

### F3 — Uncontrolled input in a `useActionState` form

Look for: `<Input`, `<Select`, `<Textarea` with `defaultValue=` inside a form
that uses `useActionState`. Components that manage their own internal state
(like `DateInput`, `TimeCombobox`, `MarkdownEditor`, `EmojiPicker`) are exempt —
they use `defaultValue` only for initialization and survive form reset.
Fix: Convert to a controlled input: add `useState` for the field value,
pass `value=` instead of `defaultValue=`, and update state in the `onChange`
handler. See `AccountForm.tsx` or `EventForm.tsx` for the pattern.

### F4 — Hidden input with `defaultValue` in a custom form component

Look for: `<input type="hidden" defaultValue=` inside components that manage
their own state (e.g. rich text editors, date pickers, custom selectors)
Fix: Use `value=` (controlled) on the hidden input so it stays in sync with
the component's internal state and survives React 19 form reset.
See `MarkdownEditor.tsx` for the pattern.

---

## Performance

### P1 — Premature memoization

Look for: `useMemo` or `useCallback` without a documented perf reason
Fix: Remove the memoization unless there's a measured performance issue.

---

## Code Smells

Ask yourself: would a staff engineer approve this PR? Look for these
common issues in AI-generated code. **Auto-fix** clear violations.
For borderline cases, note them as "consider simplifying" in the summary
rather than making changes.

### E1 — Duplicated logic

Look for: similar code blocks across changed files, or within the same file.
The same 3+ lines appearing twice is a signal.
Fix: extract a shared function. If it's used across files, put it in a shared
module. If within one file, extract a local function.

### E2 — Scope creep

Look for: changes to code unrelated to the task — refactoring, "improvements,"
added features, or cleanup beyond what was asked for.
Fix: revert unrelated changes. Keep the diff focused.

### E3 — Unnecessary files

Look for: new files that could be additions to existing files. Utility files
with a single export. Wrapper modules that just re-export.
Fix: colocate in the existing file or directory.

### E4 — Unclear naming

Look for: generic names (`data`, `result`, `item`, `info`, `handle`, `stuff`),
abbreviations (`evt`, `usr`, `btn`), single-letter variables (except `i`, `j`
in loops).
Fix: rename to describe purpose — `pendingEvents`, `approveEvent`, `ticketPrice`.

### E5 — Over-engineered for the task

Look for: config objects nobody configures, options parameters with one caller,
generic types used once, try/catch around code that can't throw, null checks
for values that are never null, feature flags for nonexistent features.
Fix: simplify to the minimum the current task requires.
