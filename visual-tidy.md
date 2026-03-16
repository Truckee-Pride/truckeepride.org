# Plan: MVP.6 Visual Tidy — Non-Form Items

## Context

This is a Next.js 15 App Router project for Truckee Pride, a small LGBTQ+ nonprofit. Read `CLAUDE.md` before starting. This task covers **visual and layout changes only** — no form schema changes, no auth changes.

**Key conventions:**

- Tailwind v4, CSS-first config in `src/app/globals.css`. Use `cn()` from `clsx`+`tailwind-merge` for conditional classes. Never string-concatenate classNames.
- Custom color tokens available as Tailwind classes: `text-brand`, `text-muted`, `text-foreground`, `bg-surface`, `bg-brand`, `border-border`, `text-inverse`.
- `LayoutWidth` from `src/lib/constants.ts`: `banner` = `max-w-3xl mx-auto`, `wide` = `max-w-2xl mx-auto px-2 sm:px-0`
- The `Button` component (`src/components/Button.tsx`) accepts a `className` prop — but it uses string concatenation internally, not `cn()`. One of the tasks below requires fixing this so className overrides work correctly. Only fix what's needed.
- Single quotes, no semicolons.

---

## Task 1 — Fix mobile padding on all pages

**Problem:** `LayoutWidth.wide` is `max-w-2xl mx-auto px-2 sm:px-0`, which gives 8px padding on mobile but removes it at `sm:` breakpoint. The intention (per TODOLIST) is "a little left and right margin on mobile" — keep some padding at all sizes.

**Fix:** In `src/lib/constants.ts`, change `wide` to add consistent small padding:

```ts
wide: 'max-w-2xl mx-auto px-3 sm:px-4',
```

This applies to every page that uses `LayoutWidth.wide` — homepage, events list, event detail, create/edit event forms.

Also check `LayoutWidth.prose` — if any pages use it, apply the same padding logic: `px-3 sm:px-4`.

Also check `LayoutWidth.banner` — the header and footer already use `banner`. Add `px-3 sm:px-4` to `banner` as well so the header/footer have consistent mobile breathing room:

```ts
banner: 'max-w-3xl mx-auto px-3 sm:px-4',
```

Do **not** change `LayoutWidth.admin`.

---

## Task 2 — Remove the Wolverines line from Footer

**File:** `src/app/Footer.tsx`

Remove the entire `<small>` block at the bottom of the footer:

```tsx
<small>
  Looking for the Wolverines? Visit{' '}
  <a href="https://truckeepride.com">TruckeePride.com</a>
</small>
```

Leave the other `<small>` (the EIN/nonprofit line) intact.

---

## Task 3 — Center footer links and small text

**File:** `src/app/globals.css` and/or `src/app/Footer.tsx`

Currently the footer `<nav>` uses `display: flex; flex-wrap: wrap; align-items: center` which left-aligns the link list. Center everything.

In `globals.css`, in the `footer nav ul` rule, add `justify-content: center`. Also add `text-align: center` to the `footer` element's base styles so the `<small>` text centers too:

```css
footer {
  margin: 3rem 0;
  text-align: center; /* add this */
}

footer nav ul {
  /* existing styles... */
  justify-content: center; /* add this */
}
```

---

## Task 4 — Hide sponsor logos (keep only 3)

**File:** `src/app/page.tsx`

The `sponsors` array at the top of the file contains ~18 entries. The user wants to keep only:

- **Truckee Cultural District** (`alt: 'Truckee Cultural District'`)
- **Church of the Mountains** (`alt: 'Church of the Mountains'`)
- **Arcteryx** — fetch from CDN (https://cdn.brandfetch.io/idEhX7aFK4/w/820/h/500/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1750540338911) (`alt: 'Arc'teryx')

Create an admin page admin/sponsors for managing these. download the 3 images we're keeping and upload them to VercelBlob. Reuse ImageUpload component for adding new ones.

Replace the entire `sponsors` array with just the two matching entries. Remove all others. The rendering code below (`sponsors.map(...)`) stays unchanged.

---

## Task 5 — Hide lodge offer section

**File:** `src/app/page.tsx`

Remove the entire section:

```tsx
<section>
  <h2>Looking for somewhere to stay?</h2>
  <p>
    Thanks to our partners at Visit Truckee Tahoe,{' '}
    <a href="https://lodging.visittruckeetahoe.com">
      you can search and book Truckee Lodging through their site
    </a>
    .
  </p>
</section>
```

---

## Task 6 — Make donate button 2D with hard color shadow and hard edges

**Goal:** The donate button should look flat/2D: square corners, a solid offset drop shadow (no blur), no rounded corners, no hover lift. Think retro/neo-brutalist style.

### Step 1 — Fix Button to use cn() for className merging

`src/components/Button.tsx` currently uses string concatenation: `` `${baseClasses} ${className}` ``. This means a passed `className` with overrides (like `rounded-none`) won't win over the base classes because `tailwind-merge` isn't applied.

Update `Button.tsx` to use `cn()`:

```tsx
import { cn } from '@/lib/cn' // or wherever cn is exported from

// Change the classes line to:
const classes = cn(
  'inline-block px-6 py-3 rounded-lg font-semibold text-xl transition-all duration-300 ease-out cursor-pointer bg-brand text-inverse no-underline hover:bg-brand-hover hover:text-inverse hover:shadow-xl hover:-translate-y-1 disabled:opacity-50',
  className,
)
```

Check where `cn` is exported from — search for `export.*cn` or check `src/lib/`. It's likely `src/lib/cn.ts` or inline in a utils file. If it doesn't exist, create `src/lib/cn.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Both `clsx` and `tailwind-merge` are already in `package.json`.

### Step 2 — Style the donate button in homepage

**File:** `src/app/page.tsx`

The donate button is:

```tsx
<Button href="/donate">{DONATE_BUTTON_TEXT}</Button>
```

Pass a `className` to override the default rounded/hover styles:

```tsx
<Button
  href="/donate"
  className="rounded-none shadow-[4px_4px_0px_0px_#171717] hover:shadow-[2px_2px_0px_0px_#171717] hover:translate-x-[2px] hover:translate-y-[2px] hover:-translate-y-0 hover:shadow-xl-none transition-none"
>
  {DONATE_BUTTON_TEXT}
</Button>
```

The exact shadow values: use a hard offset shadow in the foreground color (`#171717`). The effect is: button sits above its shadow, on hover it shifts down+right to "press" into the shadow.

Use Tailwind's arbitrary value syntax for the shadow: `shadow-[4px_4px_0px_0px_#171717]` (resting), `shadow-[2px_2px_0px_0px_#171717]` + `translate-x-0.5 translate-y-0.5` (hover pressed). Remove the base `hover:-translate-y-1` and `hover:shadow-xl` from base Button styles by overriding via `cn()` merge (the `className` override wins with tailwind-merge).

Also override: `rounded-none`, remove `transition-all duration-300 ease-out` in favor of `transition-shadow transition-transform duration-100`.

---

## Task 7 — Event tiles: solid single-color outline

**Problem:** `EventCard` uses a `border-l-[5px]` colored left-border with the rest of the border from `border-border` (gray). The user wants a solid single-color outline — the pride color as the full border.

**File:** `src/components/EventCard.tsx`

Current:

```tsx
<div
  className="flex h-[15rem] overflow-hidden rounded-xl border border-border border-l-[5px] bg-background transition-all duration-200 ease-out group-hover:-translate-y-0.5 group-hover:shadow-lg"
  style={{ borderLeftColor: borderColor }}
>
```

Change to use the pride color as the full border (solid, same color all around, 2px):

```tsx
<div
  className="flex h-[15rem] overflow-hidden rounded-xl border-2 bg-background transition-all duration-200 ease-out group-hover:-translate-y-0.5 group-hover:shadow-lg"
  style={{ borderColor: borderColor }}
>
```

Remove `border-border` and `border-l-[5px]`. Use `border-2` for consistent weight. Apply the `borderColor` via inline style to the full border instead of just the left.

---

## Verification steps

```bash
pnpm lint
pnpm typecheck
pnpm build
```

All must pass with zero errors or warnings.

Visual checks (`pnpm dev`):

1. Mobile view (375px): all pages should have visible side margins — no content flush to edge.
2. Footer: links centered, no Wolverines line, EIN line centered.
3. Homepage: only 2 sponsor logos visible (Cultural District + Church of the Mountains).
4. Homepage: no lodge section.
5. Donate button: flat, square corners, hard offset shadow visible, presses on hover.
6. Event cards (events list + homepage): full-color border all around, not just left.

## Done

Delete these items from `TODOLIST.md` when all verification steps pass:

- "Hide all sponsor logos except Cultural District, Church of the mountains, Arcteryx"
- "Hide lodge offer section (the link is out of date)"
- "All pages should have container with a little left and right margin on mobile"
- "Center the footer links and small text"
- "Remove the 'looking for wolverines line'"
- "In the tiles for events lets make it a solid single color outline"
- "Make the donate button look like original (color hard shadow, 2d, hard edges)"
