# Truckee Pride Website — Task List

> **Actively maintained.** Check off tasks as completed. For architecture decisions and technical reference, see `ARCHITECTURE.md`.

---

## Phase 0: Scaffolding & Deployment
**Goal: Deployed Next.js app with database connected, placeholder typography working.**

- [ ] **0.5** Verify `pnpm dev` runs successfully
- [ ] **0.6** Deploy to Vercel. Confirm preview deploys work on PRs.
- [ ] **0.7** Set up Neon Postgres database (free tier). Add `DATABASE_URL` to Vercel env vars and local `.env`.

---

## Phase 1: Database Schema & Auth Stub
**Goal: Full schema migrated to Neon, dev user stub working, Drizzle queries verified.**

- [ ] **1.1** Define Drizzle schema in `src/db/schema/`: `users.ts`, `events.ts`, `audit.ts`, `index.ts`
- [ ] **1.2** Configure `drizzle-kit` in `drizzle.config.ts`
- [ ] **1.3** Run `drizzle-kit generate` and `drizzle-kit migrate` against Neon
- [ ] **1.4** Set up Drizzle client in `src/lib/db.ts` using `@neondatabase/serverless`
- [ ] **1.5** Create auth stub (`src/lib/auth-stub.ts`): `getCurrentUser()` returns hardcoded admin. Seed Neon with stub user.
- [ ] **1.6** Create Zod schemas in `src/lib/schemas/events.ts`: `createEventSchema` and `updateEventSchema`
- [ ] **1.7** Verify Drizzle: render test Server Component querying `SELECT count(*) FROM users`

---

## Phase 2: Events CRUD & List View
**Goal: Create, edit, list, view, approve events. Full working flow with stubbed auth, black-and-white styling.**

- [ ] **2.1** Audit log utility (`src/lib/audit.ts`): `logAction(action, userId, targetType, targetId)`
- [ ] **2.2** Slug utility (`src/lib/slug.ts`): `generateSlug(title)` + `ensureUniqueSlug(slug, db)`
- [ ] **2.3** Page route: `src/app/(dashboard)/events/new/page.tsx`
- [ ] **2.4** Build `EventForm` client component: title, description (markdown), location (name/address), start+end datetime, image URL (real upload Phase 4), external URL. "Save as Draft" and "Submit for Review" buttons. Client-side Zod validation with inline errors.
- [ ] **2.5** Server Action `createEvent`: `getCurrentUser()` → Zod validate → generate slug → insert → audit log → return `{ success, data: { id, slug } }`
- [ ] **2.6** Server Action `submitEventForReview`: draft → pending_review + audit log (skip email — Phase 3)
- [ ] **2.7** Page route `src/app/(dashboard)/events/[id]/edit/page.tsx`: fetch event, check `canEditEvent`, pass to EventForm
- [ ] **2.8** Server Action `updateEvent`: Zod validate → update → audit log
- [ ] **2.9** Admin approval queue `src/app/(dashboard)/admin/events/page.tsx`: list pending_review events with approve/reject buttons; reject shows reason input
- [ ] **2.10** Server Actions `approveEvent` and `rejectEvent`: set status, save reason, audit log (skip email — Phase 3)
- [ ] **2.11** Events list `src/app/(public)/events/page.tsx`: upcoming approved events (asc), past events section (desc), event cards with title/date/location/image/link
- [ ] **2.12** Event detail `src/app/(public)/events/[slug]/page.tsx`: fetch by slug (approved only), `notFound()` if missing, render description, `generateMetadata()` for SEO
- [ ] **2.13** Dashboard `src/app/(dashboard)/dashboard/page.tsx`: current user's events (all statuses), status badges, edit links, "Create New Event" button
- [ ] **2.14** Dashboard layout `src/app/(dashboard)/layout.tsx`: nav (Dashboard, Create Event, Admin links), stub user display, back to public site link
- [ ] **2.15** Admin event owners page `src/app/(dashboard)/admin/events/[id]/owners/page.tsx`: list current owners, add/remove owners by email

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

## Phase 6: Launch Prep
**Goal: Production polish, SEO, security, go live.**

- [ ] **6.1** `loading.tsx` skeletons: events list, event detail, dashboard, admin.
- [ ] **6.2** `error.tsx` boundaries for graceful error recovery.
- [ ] **6.3** Branded `not-found.tsx` (404).
- [ ] **6.4** Empty states: no events, no pending approvals, no user events.
- [ ] **6.5** Custom domain on Vercel (truckeepride.org).
- [ ] **6.6** DNS: domain → Vercel, verify email DNS (SPF/DKIM).
- [ ] **6.7** Security: rate limiting on sign-in, Zod sanitization, image upload server-side validation, route guards verified.
- [ ] **6.8** SEO: `app/sitemap.ts` (dynamic), `robots.txt`, JSON-LD on events, OG images/metadata, favicon.
- [ ] **6.9** Analytics: Vercel Analytics and/or Plausible.
- [ ] **6.10** Performance: Lighthouse, Core Web Vitals.
- [ ] **6.11** Test all email flows on production domain.
- [ ] **6.12** Admin user management `/admin/users`: list users, change roles. Simple table.
- [ ] **6.13** DNS cutover from Webflow → Vercel. **Go live.**
