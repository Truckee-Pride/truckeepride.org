# Truckee Pride Website — Task List

> **Actively maintained.** Check off tasks as completed. For architecture decisions and technical reference, see `ARCHITECTURE.md`.

---

## Phase 0: Scaffolding & Deployment
**Goal: Deployed Next.js app with database connected, placeholder typography working.**

- [ ] **0.1** Initialize Turborepo with pnpm workspaces (`pnpm dlx create-turbo@latest`)
- [ ] **0.2** Create `apps/web` with Next.js 15 (App Router, TypeScript, Tailwind CSS v4, ESLint)
- [ ] **0.3** Create shared packages: `packages/db`, `packages/validators`, `packages/types`, `packages/ui`, `packages/eslint-config`, `packages/typescript-config`
- [ ] **0.4** Configure `turbo.json` with build/dev/lint pipelines
- [ ] **0.5** Set up root `.env.example` and `.gitignore`
- [ ] **0.6** Set up placeholder design system:
  - Confirm font from truckeepride.org via browser DevTools (likely DM Sans)
  - Configure `next/font/google` in root layout with confirmed font
  - Set base typography in `globals.css`: h1–h4 hierarchy, body text, link styles
  - Black text (#111) on white (#fff) — no colors yet
- [ ] **0.7** Create minimal homepage: "Truckee Pride" h1 + test headings to verify font/typography
- [ ] **0.8** Verify `turbo dev` runs successfully
- [ ] **0.9** Deploy to Vercel. Confirm preview deploys work on PRs.
- [ ] **0.10** Set up Neon Postgres database (free tier). Add `DATABASE_URL` to Vercel env vars and local `.env`.

---

## Phase 1: Database Schema & Auth Stub
**Goal: Full schema migrated to Neon, dev user stub working, Drizzle queries verified.**

- [ ] **1.1** Define Drizzle schema in `packages/db/src/schema/`:
  - `users.ts` — users, userRoleEnum, userPermissions, globalPermissionEnum
  - `events.ts` — events, eventStatusEnum, eventEditors, eventEditorRoleEnum
  - `audit.ts` — auditLog, auditActionEnum
  - `gallery.ts` — galleryImages
  - `index.ts` — re-export all
  - **Skip Auth.js tables** (accounts, sessions, verificationTokens) — Phase 3
- [ ] **1.2** Configure `drizzle-kit` in `apps/web/drizzle.config.ts`
- [ ] **1.3** Run `drizzle-kit generate` and `drizzle-kit migrate` against Neon
- [ ] **1.4** Set up Drizzle client in `apps/web/src/lib/db.ts` using `@neondatabase/serverless`
- [ ] **1.5** Create auth stub (`src/lib/auth-stub.ts`):
  - `getCurrentUser()` returns hardcoded admin `SessionUser`
  - Seed Neon with stub user: `INSERT INTO users (id, email, name, role) VALUES ('dev-user-001', 'dev@truckeepride.org', 'Dev Admin', 'admin')`
- [ ] **1.6** Create Zod schemas in `packages/validators/src/events.ts`:
  - `createEventSchema` — title (required, max 200), description (required), locationName (required), locationAddress (optional), locationLat/Lng (optional, valid range), startTime (required), endTime (optional, after start), externalUrl (optional, valid URL), imageUrl (optional)
  - `updateEventSchema` — same fields, all optional (partial)
- [ ] **1.7** Verify Drizzle: render test Server Component that queries `SELECT count(*) FROM users`

---

## Phase 2: Events CRUD & List View
**Goal: Create, edit, list, view, approve events. Full working flow with stubbed auth, black-and-white styling.**

### Utilities
- [ ] **2.1** Create audit log utility (`src/lib/audit.ts`): `logAction(action, userId, targetType, targetId, metadata?)`
- [ ] **2.2** Create slug utility (`src/lib/slug.ts`): `generateSlug(title)` + `ensureUniqueSlug(slug, db)`

### Event Creation
- [ ] **2.3** Create page route: `src/app/(dashboard)/events/new/page.tsx`
- [ ] **2.4** Build `EventForm` client component (`src/components/events/event-form.tsx`):
  - Title input
  - Description textarea (markdown)
  - Location: name + address + optional lat/lng
  - Start datetime (`<input type="datetime-local">`), optional end datetime
  - Image: text input to paste URL (real upload in Phase 5)
  - External URL input
  - "Save as Draft" and "Submit for Review" buttons
  - Client-side Zod validation with inline errors
- [ ] **2.5** Server Action `createEvent` (`src/lib/actions/events.ts`):
  - `getCurrentUser()` → Zod validate → generate slug → insert (draft or pending_review) → audit log → return `{ success, data: { id, slug } }`
- [ ] **2.6** Server Action `submitEventForReview`:
  - draft → pending_review, audit log (skip email — Phase 3)

### Event Editing
- [ ] **2.7** Page route: `src/app/(dashboard)/events/[id]/edit/page.tsx`
  - Fetch event, check `canEditEvent` (always true with stub), pass to EventForm
- [ ] **2.8** Server Action `updateEvent`:
  - Zod validate → compute diff → update record → audit log with `{ changedFields }`

### Event Approval
- [ ] **2.9** Admin approval queue: `src/app/(dashboard)/admin/events/page.tsx`
  - List pending_review events: title, submitter, date, approve/reject buttons
  - Reject shows text input for reason
- [ ] **2.10** Server Actions `approveEvent` and `rejectEvent`:
  - Set status, save rejection reason if applicable, audit log (skip email — Phase 3)

### Public Event Pages
- [ ] **2.11** Events list: `src/app/(public)/events/page.tsx`
  - Approved upcoming events sorted by startTime asc
  - Past events section sorted desc
  - Simple event cards: title, formatted date, location, image, link to detail
- [ ] **2.12** Event detail: `src/app/(public)/events/[slug]/page.tsx`
  - Fetch by slug (approved only), `notFound()` if missing
  - Render: title, description via `react-markdown`, date/time, location + address, image, external link
  - `generateMetadata()` for SEO (title, description, og:image)

### Dashboard
- [ ] **2.13** Dashboard: `src/app/(dashboard)/dashboard/page.tsx`
  - Current user's events (all statuses), status badges, edit links, "Create New Event" button
- [ ] **2.14** Dashboard layout: `src/app/(dashboard)/layout.tsx`
  - Nav: Dashboard, Create Event, Admin links
  - Stub user info display, back to public site link

### Audit Log
- [ ] **2.15** Event audit log: `src/app/(dashboard)/events/[id]/audit/page.tsx`
  - Timeline: action, who, when, changed fields

---

## Phase 3: Authentication & Email
**Goal: Replace stub with real magic link auth. Wire up email notifications.**

- [ ] **3.1** Set up Resend account. Verify truckeepride.org domain (SPF/DKIM — coordinate with David).
- [ ] **3.2** Add Auth.js tables to Drizzle schema (accounts, sessions, verificationTokens). Generate + run migration.
- [ ] **3.3** Configure Auth.js v5 (`src/lib/auth.ts`): Resend provider, Drizzle adapter, database sessions.
- [ ] **3.4** Replace `getCurrentUser()`: import `auth()`, return real session, remove stub. Same signature.
- [ ] **3.5** Sign-in page (`/sign-in`): email input → `signIn("resend", { email })` → redirect to verify.
- [ ] **3.6** Verify page (`/verify`): "Check your email" + resend link.
- [ ] **3.7** Auth middleware (`middleware.ts`): protect `/dashboard/*` and `/admin/*`.
- [ ] **3.8** Admin guard in `/admin/layout.tsx`: check `role === 'admin'`, 403 if not.
- [ ] **3.9** Implement permission helpers (`src/lib/permissions.ts`): `canEditEvent`, `canApproveEvents`, `isAdmin`, `hasPermission`.
- [ ] **3.10** Wire permissions into existing Server Actions (createEvent, updateEvent, approve, reject).
- [ ] **3.11** Seed production admin accounts (you + David).
- [ ] **3.12** Build React Email templates: magic link, event submitted, approved, rejected, editor invitation.
- [ ] **3.13** Email utility (`src/lib/email.ts`) wrapping Resend.
- [ ] **3.14** Wire emails: submitForReview → approvers, approve → owner, reject → owner.
- [ ] **3.15** Auth UI in site header: sign-in/sign-out, user display.
- [ ] **3.16** E2E test: sign in → magic link → dashboard → create → submit → approve → public → sign out.

---

## Phase 4: ACL Features
**Goal: Event editor invitations, user management, global audit log.**

- [ ] **4.1** Event editor invitation: UI on edit page, `inviteEventEditor` action, email, audit log. Show/remove editors.
- [ ] **4.2** `removeEventEditor` action + audit log.
- [ ] **4.3** Admin user management (`/admin/users`): list users, search, show role/permissions/event count.
- [ ] **4.4** User management actions: `setUserRole`, `grantPermission`, `revokePermission` — admin only, audit logged.
- [ ] **4.5** Global audit log (`/admin/audit`): all entries, filter by action/user/date/target, paginated.

---

## Phase 5: Image Uploads
**Goal: Real file upload via Vercel Blob replacing URL paste.**

- [ ] **5.1** Set up Vercel Blob. Add `BLOB_READ_WRITE_TOKEN` to env.
- [ ] **5.2** Upload Server Action: accept FormData, validate type (jpeg/png/webp/gif) + size (max 5MB), upload to Blob, return URL.
- [ ] **5.3** Update EventForm: real `<input type="file">` with client preview, upload on submit.
- [ ] **5.4** Configure `next.config.ts` `images.remotePatterns` for Blob domain. Use `next/image` everywhere.

---

## Phase 6: Homepage & Content Pages
**Goal: Real homepage, MDX pages, site nav/footer.**

- [ ] **6.1** MDX processing setup. Content catch-all route (`/[...slug]/page.tsx`).
- [ ] **6.2** Write MDX content (migrate from Webflow): about, mental-health, business-guide, get-involved.
- [ ] **6.3** Site header/nav: logo, nav links (Events, Get Involved, About, Donate, Merch), auth UI, mobile hamburger.
- [ ] **6.4** Site footer: links (Donate, Contact, Merch, WhatsApp, Instagram), resources, 501(c)(3) info.
- [ ] **6.5** Homepage: hero (existing artwork), about blurb, upcoming events (3–5), sponsors grid, gallery teaser, community links.
- [ ] **6.6** Get Involved page: volunteer form (name, email, interests, message → Resend to hello@truckeepride.org).
- [ ] **6.7** Sponsors component, donation page/redirect, merch external link.
- [ ] **6.8** Migrate remaining content: download images, verify links, copy text.

---

## Phase 7: Photo Gallery
**Goal: Admin upload and public gallery.**

- [ ] **7.1** Admin gallery management (`/admin/gallery`): upload via Blob, alt/caption/year, reorder, delete.
- [ ] **7.2** Public gallery (`/gallery`): responsive grid, year filter tabs, lightbox.
- [ ] **7.3** Optimize with `next/image`: responsive sizes, lazy loading, blur placeholders.

---

## Phase 8: Design System & Visual Polish
**Goal: Replace black-and-white with full branded design.**

- [ ] **8.1** Design tokens: color palette (pride rainbow + warm neutrals), typography refinements, border radius, shadows.
- [ ] **8.2** Reusable components: Button (variants), Card, Input/Textarea/Select, Badge (status), Dialog (Radix), Toast, Date picker.
- [ ] **8.3** Apply design across all pages: homepage, events, dashboard, admin, forms.
- [ ] **8.4** Responsive pass: mobile (375px), tablet (768px), desktop (1280px+).
- [ ] **8.5** Accessibility: keyboard nav, screen reader, WCAG AA contrast, focus indicators, alt text, reduced motion.

---

## Phase 9: Error Handling, Loading States & Launch
**Goal: Production polish, SEO, security, go live.**

- [ ] **9.1** `loading.tsx` skeletons: events list, event detail, dashboard, admin.
- [ ] **9.2** `error.tsx` boundaries for graceful error recovery.
- [ ] **9.3** Branded `not-found.tsx` (404).
- [ ] **9.4** Empty states: no events, no pending, no audit entries, no user events.
- [ ] **9.5** Form validation UX: inline errors, field highlighting, disabled submit while pending.
- [ ] **9.6** Suspense boundaries around dynamic sections.
- [ ] **9.7** Custom domain on Vercel (truckeepride.org).
- [ ] **9.8** DNS: domain → Vercel, verify email DNS (SPF/DKIM).
- [ ] **9.9** Security: rate limiting on sign-in, Zod sanitization, image upload server-side validation, route guards verified.
- [ ] **9.10** SEO: `app/sitemap.ts` (dynamic), `robots.txt`, JSON-LD on events, OG images/metadata, favicon.
- [ ] **9.11** Analytics: Vercel Analytics and/or Plausible.
- [ ] **9.12** Performance: Lighthouse, Core Web Vitals.
- [ ] **9.13** README: setup, env vars, deployment, adding content.
- [ ] **9.14** Test all email flows on production domain.
- [ ] **9.15** DNS cutover from Webflow → Vercel. **Go live.**
