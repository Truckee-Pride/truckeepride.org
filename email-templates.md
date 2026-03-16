# Plan: MVP.3.3 + MVP.3.4 + MVP.3.5 — React Email Templates

## Context

This is a Next.js 15 App Router project for Truckee Pride, a small LGBTQ+ nonprofit. Read `CLAUDE.md` before starting.

These are **presentational-only** React Email templates. They are not wired up to any sending logic yet — that's MVP.3.2/3.6. The goal here is to write the three template files so they're ready to import.

React Email components render to HTML email. They use their own primitives instead of HTML tags — do **not** use regular `<div>`, `<p>`, `<a>` etc. Use the React Email components.

---

## Setup — Install React Email

React Email is not yet in `package.json`. Install it:

```bash
pnpm add @react-email/components
```

Do **not** install `react-email` (the dev CLI) — only the components package is needed.

The `@react-email/components` package exports all primitives as named exports:
`Html`, `Head`, `Body`, `Container`, `Section`, `Text`, `Button`, `Link`, `Hr`, `Preview`, `Heading`, `Img`

---

## Brand reference

From `globals.css`:

- Brand color (pink): `#b800bf`
- Foreground (near-black): `#171717`
- Muted text: `#6b7280`
- Background: `#ffffff`
- Border: `#e5e7eb`

Keep emails simple and readable. No complex layouts. Plain white background, the brand pink for CTAs, black for body text. A single centered column, max-width 600px.

---

## Shared pattern

Every template follows this shape:

```tsx
import {
  Html, Head, Body, Container, Section, Text, Button, Link, Hr, Preview, Heading
} from '@react-email/components'

type Props = {
  // template-specific props
}

export function TemplateName({ ...props }: Props) {
  return (
    <Html>
      <Head />
      <Preview>One-line email preview text</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* content */}
        </Body>
      </Container>
    </Html>
  )
}

// Inline styles — React Email requires inline styles, not Tailwind
const bodyStyle = {
  backgroundColor: '#ffffff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}
const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '40px 24px',
}
```

Use named exports (not default exports). Use inline `style` objects — React Email does **not** support Tailwind CSS.

---

## Task 1 — MVP.3.3: Magic link email (`src/emails/magic-link.tsx`)

### Purpose

Sent by Auth.js when a user requests a sign-in link. Auth.js v5 with Resend provider calls this template and passes the magic link URL.

### Props

```ts
type Props = {
  url: string // the magic link URL (provided by Auth.js)
  email: string // the recipient's email address
}
```

### Content

- **Preview text:** "Sign in to Truckee Pride"
- **Heading:** "Sign in to Truckee Pride"
- **Body text:** "Click the button below to sign in. This link expires in 24 hours and can only be used once."
- **CTA button:** "Sign In" → links to `url`. Style: `backgroundColor: '#b800bf'`, white text, `padding: '12px 24px'`, `borderRadius: '8px'`, `fontWeight: '600'`
- **Security note** (small muted text below button): "If you didn't request this email, you can safely ignore it."
- **Footer** (after `<Hr />`): "Truckee Tahoe Pride Foundation · 501(c)3 nonprofit · Truckee, CA"

### File to create

`src/emails/magic-link.tsx`

---

## Task 2 — MVP.3.4: Event approved email (`src/emails/event-approved.tsx`)

### Purpose

Sent to the event owner when an admin approves their event.

### Props

```ts
type Props = {
  eventTitle: string
  eventUrl: string // full URL to the public event page, e.g. https://truckeepride.org/events/my-event-slug
  ownerName: string | null
}
```

### Content

- **Preview text:** `Your event "${eventTitle}" has been approved`
- **Greeting:** `Hi ${ownerName ?? 'there'},`
- **Body:** "Great news! Your event has been approved and is now live on the Truckee Pride calendar."
- **Event title** displayed prominently (bold, larger text)
- **CTA button:** "View Your Event" → links to `eventUrl`. Same brand pink style as magic link button.
- **Closing:** "Thank you for contributing to our community! If you need to make any changes, you can edit the event from the page."
- **Footer** (after `<Hr />`): "Truckee Tahoe Pride Foundation · 501(c)3 nonprofit · Truckee, CA"

### File to create

`src/emails/event-approved.tsx`

---

## Task 3 — MVP.3.5: Event rejected email (`src/emails/event-rejected.tsx`)

### Purpose

Sent to the event owner when an admin rejects their event, with the reason. The owner can edit and resubmit.

### Props

```ts
type Props = {
  eventTitle: string
  editUrl: string // full URL to the event edit page
  rejectionReason: string // the reason the admin entered
  ownerName: string | null
}
```

### Content

- **Preview text:** `Your event "${eventTitle}" needs some changes`
- **Greeting:** `Hi ${ownerName ?? 'there'},`
- **Body:** "Thanks for submitting an event to Truckee Pride. We reviewed your submission and have a few notes:"
- **Rejection reason** — display in a styled block: light gray background (`#f9fafb`), `padding: '16px'`, `borderRadius: '8px'`, `borderLeft: '4px solid #e5e7eb'`. Render the `rejectionReason` string inside this block as a `<Text>`.
- **Follow-up text:** "You're welcome to update your event and resubmit for review."
- **CTA button:** "Edit Your Event" → links to `editUrl`. Same brand pink style.
- **Closing:** "Questions? Reply to this email or reach us at hello@truckeepride.org."
- **Footer** (after `<Hr />`): "Truckee Tahoe Pride Foundation · 501(c)3 nonprofit · Truckee, CA"

### File to create

`src/emails/event-rejected.tsx`

---

## Directory structure after this task

```
src/
  emails/
    magic-link.tsx
    event-approved.tsx
    event-rejected.tsx
```

There is no existing `src/emails/` directory — create it.

---

## Verification steps

```bash
pnpm lint
pnpm typecheck
pnpm build
```

All three must pass. TypeScript will catch any prop mismatches or missing imports.

There is no runtime test yet (sending is wired in MVP.3.6). Verify by:

1. Importing one template in a scratch component and confirming TypeScript is satisfied.
2. Optionally: `npx react-email dev` to preview in browser (not required — just helpful).

## Done

Delete **MVP.3.3**, **MVP.3.4**, and **MVP.3.5** from `TODOLIST.md` when all verification steps pass.
