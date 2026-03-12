# Truckee Pride Website — Task List

> **Actively maintained.** Check off tasks as completed. For architecture decisions and technical reference, see `ARCHITECTURE.md`.

---

## Phase 2: Events CRUD & List View

**Goal: Create, edit, list, view, approve events. Full working flow with stubbed auth, black-and-white styling.**

- [ ] **2.3** Page route: `src/app/events/new/page.tsx`
- [ ] **2.4** Build `EventForm` client component: title, description (markdown), location (name/address), start+end datetime, image URL (real upload Phase 4), external URL. "Save as Draft" and "Submit for Review" buttons. Client-side Zod validation with inline errors.
- [ ] **2.5** Server Action `createEvent`: `getCurrentUser()` → Zod validate → generate slug → insert → audit log → return `{ success, data: { id, slug } }`
- [ ] **2.6** Server Action `submitEventForReview`: draft → pending_review + audit log (skip email — Phase 3)
- [ ] **2.7** Page route `src/app/events/[id]/edit/page.tsx`: fetch event, check `canEditEvent`, pass to EventForm
- [ ] **2.8** Server Action `updateEvent`: Zod validate → update → audit log
- [ ] **2.9** Admin approval queue: add approve/reject buttons to `src/app/admin/events/page.tsx`; reject shows reason input
- [ ] **2.10** Server Actions `approveEvent` and `rejectEvent` in `src/app/admin/events/actions.ts`: set status, save reason, audit log (skip email — Phase 3)
- [ ] **2.13** Dashboard `src/app/dashboard/page.tsx`: current user's events (all statuses), status badges, edit links, "Create New Event" button
- [ ] **2.14** Dashboard layout `src/app/dashboard/layout.tsx`: nav (Dashboard, Create Event, Admin links), stub user display, back to public site link
- [ ] **2.15** Admin event owners page `src/app/admin/events/[id]/owners/page.tsx`: list current owners, add/remove owners by email

---

## Phase 3: Authentication & Email

**Goal: Replace stub with real magic link auth. Wire up email notifications.**

- [ ] **3.1** Set up Resend account. Verify truckeepride.org domain (SPF/DKIM — coordinate with David).
- [ ] **3.2** Add Auth.js tables to Drizzle schema (accounts, sessions, verificationTokens). Generate + run migration.
- [ ] **3.3** Configure Auth.js v5 (`src/lib/auth.ts`): Resend provider, Drizzle adapter, database sessions.
- [ ] **3.4** Replace `getCurrentUser()` with real `auth()` session. Same signature, no other changes.
- [ ] **3.5** Sign-in page `/sign-in`: email input → `signIn("resend", { email })` → redirect to verify.
- [ ] **3.6** Verify page `/verify`: "Check your email" + resend link.
- [ ] **3.7** Auth middleware (`middleware.ts`): protect `/dashboard/*` and `/admin/*`.
- [ ] **3.8** Admin guard in `/admin/layout.tsx`: check `role === 'admin'`, 403 if not.
- [ ] **3.9** Wire ownership checks into Server Actions (createEvent, updateEvent, approve, reject, manage owners).
- [ ] **3.10** Seed production admin accounts (pride organizers).
- [ ] **3.11** Build React Email templates: magic link, event approved, event rejected.
- [ ] **3.12** Email utility (`src/lib/email.ts`) wrapping Resend.
- [ ] **3.13** Wire emails: approve → owner, reject → owner.
- [ ] **3.14** Auth UI in site header: sign-in/sign-out, user display.

---

## MVP Launch: Go Live with Admin Events

**Goal: Replace existing Webflow site. Admins can create/edit/view events. Public can browse events.**

- [ ] **MVP.1** Custom domain on Vercel (truckeepride.org).
- [ ] **MVP.2** DNS: domain → Vercel, verify email DNS (SPF/DKIM).
- [ ] **MVP.3** `error.tsx` boundaries for graceful error recovery.
- [ ] **MVP.4** Branded `not-found.tsx` (404).
- [ ] **MVP.5** Empty states: no events, no pending approvals, no user events.
- [ ] **MVP.6** Security: rate limiting on sign-in, Zod sanitization, route guards verified.
- [ ] **MVP.7** Test all email flows on production domain.
- [ ] **MVP.8** DNS cutover from Webflow → Vercel. **Go live.**

---

## Phase 4: Homepage, Content & Image Uploads

**Goal: Real homepage, content pages, site navigation, image uploads working.**

- [ ] **4.1** Site header/nav: logo, nav links (Events, Get Involved, About, Donate), auth UI, mobile hamburger.
- [ ] **4.2** Site footer: links (Donate, Contact, WhatsApp, Instagram), resources, 501(c)(3) info.
- [ ] **4.3** Homepage: hero (existing artwork), about blurb, upcoming events (3–5), sponsors grid, community links.
- [ ] **4.4** About page (`src/app/(public)/about/page.tsx`): org info, mission, team. Plain React Server Component.
- [ ] **4.5** Get Involved page: volunteer form (name, email, interests, message → Resend to hello@truckeepride.org).
- [ ] **4.6** Resources page: mental health, business guide, community links. Plain React Server Component.
- [ ] **4.7** Sponsors component and donation page/redirect.
- [ ] **4.8** Set up Vercel Blob. Add `BLOB_READ_WRITE_TOKEN` to env.
- [ ] **4.9** Upload Server Action: accept FormData, validate type (jpeg/png/webp/gif) + size (max 5MB), upload to Blob, return URL.
- [ ] **4.10** Update EventForm: real `<input type="file">` with client preview, upload on submit.
- [ ] **4.11** Configure `next.config.ts` `images.remotePatterns` for Blob domain. Use `next/image` everywhere.

---

## Phase 5: Design System & Visual Polish

**Goal: Replace black-and-white with full branded design.**

- [ ] **5.1** Design tokens in `globals.css`: color palette (pride rainbow + warm neutrals), typography refinements, border radius, shadows.
- [ ] **5.2** Reusable components: Button (variants), Card, Input/Textarea/Select, Badge (status), Dialog, Toast.
- [ ] **5.3** Apply design across all pages: homepage, events, dashboard, admin, forms.
- [ ] **5.4** Responsive pass: mobile (375px), tablet (768px), desktop (1280px+).
- [ ] **5.5** Accessibility: keyboard nav, screen reader, WCAG AA contrast, focus indicators, alt text, reduced motion.

---

## Phase 6: Post-Launch Polish

**Goal: SEO, analytics, performance, admin tools.**

- [ ] **6.1** `loading.tsx` skeletons: events list, event detail, dashboard, admin.
- [ ] **6.2** SEO: `app/sitemap.ts` (dynamic), `robots.txt`, JSON-LD on events, OG images/metadata, favicon.
- [ ] **6.3** Analytics: Vercel Analytics and/or Plausible.
- [ ] **6.4** Performance: Lighthouse, Core Web Vitals.
- [ ] **6.5** Admin user management `/admin/users`: list users, change roles. Simple table.
