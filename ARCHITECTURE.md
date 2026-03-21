# Truckee Pride Website — Architecture & Technical Reference

> **Reference document.** Only update when architecture decisions change. For active work tracking, see `TODOLIST.md`.

## Overview

Truckee Tahoe Pride Foundation is a 501(c)(3) nonprofit (EIN 994735689) based in Truckee, CA. Rebuilding truckeepride.org from a static Webflow site into a full-stack events platform with admin approval and event ownership.

**Budget:** $20–50/month hosting. Prefer free tiers.

---

## Tech Stack

| Layer             | Technology                            | Rationale                                                             |
| ----------------- | ------------------------------------- | --------------------------------------------------------------------- |
| **Framework**     | Next.js 15 (App Router, TypeScript)   | SSR for SEO, RSC, Server Actions, streaming.                          |
| **Hosting**       | Vercel                                | Best Next.js DX, preview deploys, edge caching. Free or Pro ($20/mo). |
| **Database**      | PostgreSQL on Neon                    | Serverless Postgres, connection pooling for Vercel, free tier.        |
| **ORM**           | Drizzle ORM                           | SQL-first, tiny bundle, no codegen, TS-native schemas.                |
| **Auth**          | Auth.js v5 with Resend email provider | Magic link only. Drizzle adapter. Sessions in Postgres.               |
| **Email**         | Resend + React Email                  | Magic links + transactional notifications. `auth@truckeepride.org`.   |
| **File Storage**  | Vercel Blob                           | Event images. S3-compatible.                                          |
| **Styling**       | Tailwind CSS v4                       | Utility-first, CSS-first config.                                      |
| **UI Primitives** | shadcn/ui (Radix + Tailwind)          | Accessible headless components, copied into `src/components/ui/`.     |
| **Validation**    | Zod                                   | Shared schemas between client and server.                             |

**Not using:** Turborepo/monorepo (single app, no need), MDX (too few content pages to justify), separate API routes (no external API consumers yet).

---

## Project Structure

This is a plain Next.js app — no monorepo, no shared packages.

```
truckeepride/
├── src/
│   ├── app/                       # App Router routes
│   │   ├── page.tsx               # Homepage
│   │   ├── events/
│   │   │   ├── page.tsx           # Events list (public)
│   │   │   ├── new/page.tsx       # Create event (auth required)
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # Event detail (public)
│   │   ├── events/[id]/
│   │   │   └── edit/page.tsx      # Edit event (auth + ownership)
│   │   ├── admin/
│   │   │   ├── layout.tsx         # Admin role guard
│   │   │   ├── events/page.tsx    # Approval queue
│   │   │   ├── events/[id]/
│   │   │   │   └── owners/page.tsx # Manage event owners
│   │   │   └── users/page.tsx
│   │   ├── sign-in/page.tsx
│   │   ├── verify/page.tsx
│   │   ├── about/page.tsx
│   │   ├── get-involved/page.tsx
│   │   ├── resources/page.tsx
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/route.ts
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css
│   ├── components/                # React components
│   │   ├── ui/                   # shadcn/ui primitives (Radix wrappers)
│   │   ├── events/
│   │   ├── layout/
│   │   └── admin/
│   ├── lib/                       # Utilities
│   │   ├── auth.ts                # Auth.js config
│   │   ├── auth-stub.ts           # Stub: fake user for dev
│   │   ├── db.ts                  # Drizzle client
│   │   ├── email.ts               # Resend client + templates
│   │   └── blob.ts                # Vercel Blob helpers
│   └── middleware.ts              # Auth.js route protection
├── drizzle/                       # Generated migrations
├── public/
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Auth Stub Strategy

During early development, auth is stubbed so features can be built without email/DNS setup. When Auth.js is wired up in Phase 3, only `getCurrentUser()` changes — no shotgun surgery.

```typescript
// src/lib/auth-stub.ts
export type SessionUser = {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (process.env.NODE_ENV === 'development') {
    return {
      id: 'dev-user-001',
      email: 'dev@truckeepride.org',
      name: 'Dev Admin',
      role: 'admin',
    }
  }
  return null // replaced with Auth.js session lookup in Phase 3
}
```

---

## Placeholder Design System

Black-and-white with system sans-serif until the full design system is built (Phase 5). Target brand fonts are Fraunces (display), Nunito Sans (body), IBM Plex Mono (accent/mono) — loaded via `next/font` in Phase 5.

---

## Database Schema

### Users & Auth

```typescript
export const userRoleEnum = pgEnum('user_role', ['user', 'admin'])

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  phone: text('phone'),
  role: userRoleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Auth.js tables (accounts, sessions, verificationTokens) added when auth is wired up
```

### Events

```typescript
export const eventStatusEnum = pgEnum('event_status', [
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'cancelled',
])

export const events = pgTable('events', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(), // Markdown
  locationName: text('location_name').notNull(),
  locationAddress: text('location_address'),
  locationLat: real('location_lat'),
  locationLng: real('location_lng'),
  startTime: timestamp('start_time', { mode: 'date' }).notNull(),
  endTime: timestamp('end_time', { mode: 'date' }),
  imageUrl: text('image_url'),
  externalUrl: text('external_url'),
  status: eventStatusEnum('status').default('draft').notNull(),
  rejectionReason: text('rejection_reason'),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const eventOwners = pgTable('event_owners', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  addedBy: text('added_by').references(() => users.id),
  addedAt: timestamp('added_at').defaultNow().notNull(),
})
```

**Ownership model:** The user who creates an event is set as `events.ownerId`. Admins can add additional owners via the `event_owners` table. A user can edit an event if they are an admin, the `ownerId`, or listed in `event_owners`.

### Audit Log

```typescript
export const auditLog = pgTable('audit_log', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  action: text('action').notNull(), // e.g. 'event_created', 'event_approved'
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  targetType: text('target_type'), // e.g. 'event', 'user'
  targetId: text('target_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

Simple action log — records who did what and when. No field-level diffs. Use Drizzle Studio to investigate if needed.

---

## Access Control

| Role          | Description                                                                        | Assigned How                              |
| ------------- | ---------------------------------------------------------------------------------- | ----------------------------------------- |
| **Admin**     | Full access: approve/reject events, edit any event, manage users and event owners. | `users.role = 'admin'`. Pride organizers. |
| **User**      | Submit new events. Edit events they own.                                           | Any logged-in user.                       |
| **Anonymous** | View approved events and public pages.                                             | No auth required.                         |

### Permission Check

```typescript
canEditEvent(userId, event) → isAdmin(userId) || event.ownerId === userId || isEventOwner(userId, event.id)
```

### Middleware Strategy

- `middleware.ts` protects `/events/new`, `/events/*/edit`, and `/admin/*` → redirect to `/sign-in`
- `/admin/layout.tsx` checks `role === 'admin'`
- Server Actions check ownership before mutating

---

## Event Lifecycle

```
[User fills form] → DRAFT
       |
[Submit for Review] → PENDING_REVIEW → [Email to admins]
       |
[Admin]──── APPROVED ──→ [Email to owner, visible on calendar]
       |
       └──── REJECTED (with reason) ──→ [Email to owner, can edit & resubmit]

[Owner or Admin] → CANCELLED (any time)
```

Every state transition writes to `audit_log`.

---

## Email Templates

1. **Magic Link** — "Sign in to Truckee Pride"
2. **Event Approved** — To owner
3. **Event Rejected** — To owner with reason

---

## Pages

| Area          | Pages                                                                                  |
| ------------- | -------------------------------------------------------------------------------------- |
| **Public**    | Homepage, Events list, Event detail, About, Get Involved, Resources, Donate (ext link) |
| **Auth**      | Sign In, Verify                                                                        |
| **Dashboard** | My Events, Create Event, Edit Event                                                    |
| **Admin**     | Approval Queue, Manage Event Owners, User Management                                   |

---

## Environment Variables

```env
DATABASE_URL=postgresql://...          # Neon (required from day 1)
AUTH_SECRET=                           # openssl rand -base64 32 (Phase 3+)
AUTH_URL=https://truckeepride.org      # Phase 3+
AUTH_RESEND_KEY=                       # Resend API key (Phase 3+)
EMAIL_FROM=auth@truckeepride.org       # Phase 3+
BLOB_READ_WRITE_TOKEN=                 # Vercel Blob (Phase 4+)
NEXT_PUBLIC_APP_URL=https://truckeepride.org
```
