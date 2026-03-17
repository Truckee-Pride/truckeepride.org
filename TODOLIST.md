# Truckee Pride Website — Task List

> **Actively maintained.** Delete tasks as completed. For architecture decisions and technical reference, see `ARCHITECTURE.md`.

---

## MVP.2.x: Authentication

**Goal: Replace auth stub with real Auth.js magic link auth. Protect routes and gate visibility.**

- [ ] **MVP.2.0** Resend sandbox setup for dev/testing:
  - Create Resend account (free tier: 3k emails/month, 100/day)
  - Generate API key → add `AUTH_RESEND_KEY` to `.env.local`
  - Generate auth secret → `openssl rand -base64 32` → add `AUTH_SECRET` to `.env.local`
  - Sandbox limitation: can only send to your own Resend account email, from `onboarding@resend.dev`
- [ ] **MVP.2.13** Edit Profile page (`/profile/edit`) — let users update their name, email, etc.

---

## MVP.3.x: Email

**Goal: Magic link emails for auth + notification emails for approval workflow.**

- [ ] **MVP.3.2** Email utility wrapping Resend SDK (`src/lib/email.ts`)
- [ ] **MVP.3.3** Magic link email template — simple, branded (`src/emails/magic-link.tsx`)
- [ ] **MVP.3.4** Event approved notification to owner (`src/emails/event-approved.tsx`)
- [ ] **MVP.3.5** Event rejected notification to owner with reason (`src/emails/event-rejected.tsx`)
- [ ] **MVP.3.6** Wire approve/reject actions to send emails (`src/app/admin/events/actions.ts`)

---

## MVP.4.x: Errors and polish

**Goal: Error handling, empty states, domain setup, go live.**

- [ ] **MVP.4.1** Root `error.tsx` boundary — friendly message, no stack traces
- [ ] **MVP.4.2** Root `not-found.tsx` — branded 404 page
- [ ] **MVP.4.3** Empty states: no events on list page, no pending approvals, no user events

---

## MVP.5.x: Abuse Prevention

**Goal: Protect event submission from spam, bots, and targeted harassment.**

- [ ] **MVP.5.1** User banning: `bannedAt` column on users, admin "Ban Submitter" button in approval queue, bulk-reject pending events on ban
- [ ] **MVP.5.2** Cloudflare Turnstile (free CAPTCHA) on event submission forms
- [ ] **MVP.5.3** Disposable email domain blocking in Auth.js signIn callback

---

## MVP.6: Event Form Polish

See `event-form-polish.md` for full specs.

- [ ] DateInput: fix text clipping at narrow widths (change grid from `xs:grid-cols-3` to `sm:grid-cols-3`)
- [ ] DateInput: dead zone between YYYY and calendar icon should have pointer cursor and open picker
- [ ] DateInput: typed year not committed on Enter / click away (fix `revertIfInvalid`)
- [ ] End Time: add "Clear" TextButton right-aligned with label (add `labelAction` slot to `FormField`, `clearable` prop to `TimeCombobox`)
- [ ] Emoji is required: Zod schema change, EmojiPicker errors prop, remove Clear button
- [ ] Short description required with min 10 / max 150 chars
- [ ] Vibe Tags: multi-select checkboxes (Sporty, Crafty, Family Focused, Smarty Pants, Let's Dance) — requires DB migration

---

## MVP.7: Tidy

- [ ] Hide all sponsor logos except Cultural District, Church of the mountains, Arcteryx
- [ ] Hide lodge offer section (the link is out of date)
- [ ] All pages should have container with a little left and right margin on mobile
- [ ] Center the footer links and small text
- [ ] Remove the "looking for wolverines line"
- [ ] In the tiles for events lets make it a solid single color outline
- [ ] Bring back the photo carousel to the homepage! Put it below the calendar
- [ ] Make the donate button look like original (color hard shadow, 2d, hard edges)
- [ ] In the Meta tags (for seo) make sure each event page has its time, date, maybe location (not address) in the description

## MVP.8: Launch

- [ ] **MVP.7.1** Verify truckeepride.org domain in Resend — coordinate with David for DNS access:
  - Add Resend MX record to truckeepride.org DNS
  - Add SPF (TXT) record
  - Add DKIM (TXT) records (Resend provides these)
  - Verify domain in Resend dashboard
  - Update `EMAIL_FROM` env var to `auth@truckeepride.org`
- [ ] **MVP.7.2** Custom domain on Vercel (truckeepride.org)
- [ ] **MVP.7.3** DNS cutover: domain → Vercel, Resend email DNS (SPF/DKIM) verified
- [ ] **MVP.7.4** Smoke test all flows: sign in, create event, submit, approve, view, emails. **Go live.**

## Deferred to Post-MVP

- [ ] "My Events" tab/filter on `/events` page: show user's own events with status badges
- [ ] Admin event owners page (`src/app/admin/events/[id]/owners/page.tsx`) — use Drizzle Studio until then
- [ ] Admin user management `/admin/users` — use Drizzle Studio until then
- [ ] Rate limiting on sign-in
- [ ] Full site nav: Get Involved, About, Donate links, mobile hamburger
- [ ] On event address do the fancy google search bar and then display a google maps link
- [ ] About page, Get Involved page
- [ ] `loading.tsx` skeletons
- [ ] Make it easy for admin to toggle sponsor logos and add new ones (we do this each year based on their sponsorship)
- [ ] Fancy React Email templates (replace plain text)
- [ ] Design system & visual polish (Dialog, Toast, responsive pass, accessibility audit)
- [ ] SEO: OG images/metadata
- [ ] Analytics: Vercel Analytics and/or Plausible
- [ ] Performance: Lighthouse, Core Web Vitals
- [ ] Make it easy for admins to edit the photo carousel image options
- [ ] Make repeat events maintain an nice slug in 2027
