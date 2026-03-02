# Truckee Pride Website — Architecture & Technical Reference

> **Reference document.** Only update when architecture decisions change. For active work tracking, see `TODOLIST.md`.

## Overview

Truckee Tahoe Pride Foundation is a 501(c)(3) nonprofit (EIN 994735689) based in Truckee, CA. We are rebuilding truckeepride.org from a static Webflow site into a full-stack events platform with role-based access control and content management.

**Primary maintainer:** Staff-level engineer, 17 years experience (React, TypeScript, Node, iOS, React Native, Rails). Most recently rebuilt a desktop design system. Relying on AI for latest best practices.

**Timeline:** Full-time for a few weeks. **Budget:** $20–50/month hosting. Prefer free tiers.

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 15 (App Router, TypeScript) | SSR for SEO, RSC, Server Actions, streaming. Not a pure SPA. |
| **Monorepo** | Turborepo + pnpm workspaces | Future React Native app, shared types/validation/API client |
| **Hosting** | Vercel | Best Next.js DX, preview deploys, edge caching, image optimization. Free or Pro ($20/mo). |
| **Database** | PostgreSQL on Neon | Serverless Postgres, native connection pooling for Vercel, free tier, branch DBs. |
| **ORM** | Drizzle ORM | SQL-first, tiny bundle (no serverless cold start issues), no codegen, TS-native schemas. |
| **Auth** | Auth.js v5 with Resend email provider | Magic link (passwordless) only. Drizzle adapter. Sessions in Postgres. |
| **Email** | Resend + React Email | Magic links + transactional notifications. Send from auth@truckeepride.org. |
| **File Storage** | Vercel Blob | Event images, photo gallery. S3-compatible. |
| **Styling** | Tailwind CSS v4 | Utility-first, CSS-first config. Radix UI for accessible interactive primitives. |
| **CMS Content** | MDX files in repo | Static pages as MDX with React component embedding. Git version controlled. |
| **Validation** | Zod | Shared schemas between client/server/future native app. |

---

## Monorepo Structure

```
truckeepride/
├── apps/
│   └── web/                          # Next.js 15 App Router application
│       ├── src/
│       │   ├── app/                   # App Router routes
│       │   │   ├── (public)/          # Route group: public pages
│       │   │   │   ├── page.tsx       # Homepage
│       │   │   │   ├── events/
│       │   │   │   │   ├── page.tsx   # Events list
│       │   │   │   │   └── [slug]/
│       │   │   │   │       └── page.tsx # Event detail (SSR for SEO)
│       │   │   │   ├── gallery/page.tsx
│       │   │   │   ├── get-involved/page.tsx
│       │   │   │   └── [...slug]/page.tsx   # MDX content catch-all
│       │   │   ├── (auth)/            # Route group: auth pages
│       │   │   │   ├── sign-in/page.tsx
│       │   │   │   └── verify/page.tsx
│       │   │   ├── (dashboard)/       # Route group: authenticated area
│       │   │   │   ├── layout.tsx     # Dashboard shell, auth guard
│       │   │   │   ├── dashboard/page.tsx   # User's events
│       │   │   │   ├── events/
│       │   │   │   │   ├── new/page.tsx
│       │   │   │   │   └── [id]/
│       │   │   │   │       ├── edit/page.tsx
│       │   │   │   │       └── audit/page.tsx
│       │   │   │   └── admin/
│       │   │   │       ├── layout.tsx # Admin role guard
│       │   │   │       ├── events/page.tsx   # Approval queue
│       │   │   │       ├── users/page.tsx
│       │   │   │       ├── gallery/page.tsx
│       │   │   │       └── audit/page.tsx
│       │   │   ├── api/               # Route Handlers (for future native app)
│       │   │   │   ├── auth/[...nextauth]/route.ts
│       │   │   │   ├── events/route.ts
│       │   │   │   ├── upload/route.ts
│       │   │   │   └── gallery/route.ts
│       │   │   ├── layout.tsx         # Root layout
│       │   │   └── globals.css
│       │   ├── components/            # App-specific React components
│       │   │   ├── events/
│       │   │   ├── layout/
│       │   │   ├── gallery/
│       │   │   └── admin/
│       │   ├── lib/                   # App-specific utilities
│       │   │   ├── auth.ts            # Auth.js config (real auth)
│       │   │   ├── auth-stub.ts       # Stub: fake user for dev
│       │   │   ├── db.ts              # Drizzle client
│       │   │   ├── email.ts           # Resend client + templates
│       │   │   └── blob.ts            # Vercel Blob helpers
│       │   ├── content/               # MDX content files
│       │   └── middleware.ts          # Auth.js route protection
│       ├── public/
│       ├── drizzle/                   # Generated migrations
│       ├── drizzle.config.ts
│       └── next.config.ts
│
├── packages/
│   ├── db/                            # Shared database schema & types
│   │   └── src/schema/ (users, events, gallery, audit, index)
│   ├── validators/                    # Shared Zod schemas
│   │   └── src/ (events, users, index)
│   ├── types/                         # Shared TypeScript types
│   │   └── src/ (events, users, auth, index)
│   ├── ui/                            # Shared UI (future RN)
│   ├── eslint-config/
│   └── typescript-config/
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── .env.example
```

---

## Auth Stub Strategy

During early development, authentication is stubbed so events can be built without email/DNS setup.

```typescript
// src/lib/auth-stub.ts
export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
};

const STUB_USER: SessionUser = {
  id: 'dev-user-001',
  email: 'dev@truckeepride.org',
  name: 'Dev Admin',
  role: 'admin',
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (process.env.NODE_ENV === 'development') return STUB_USER;
  return null; // Replaced with Auth.js session lookup when auth is wired up
}
```

Every Server Action and page calls `getCurrentUser()`. When Auth.js is wired up, only this function changes — no shotgun surgery.

---

## Placeholder Design System

Black-and-white with good typography until the full design system is built.

**Font:** Current truckeepride.org likely uses **DM Sans** (Google Font). **Confirm via Chrome DevTools before starting** — inspect `<body>` → Computed → `font-family`.

```typescript
// apps/web/src/app/layout.tsx
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

```css
/* globals.css */
@import "tailwindcss";

@theme {
  --font-sans: var(--font-sans), ui-sans-serif, system-ui, -apple-system, sans-serif;
}

@layer base {
  html { color: #111; background: #fff; }
  h1 { @apply text-4xl font-bold tracking-tight mb-4; }
  h2 { @apply text-2xl font-semibold tracking-tight mb-3; }
  h3 { @apply text-xl font-semibold mb-2; }
  h4 { @apply text-lg font-medium mb-2; }
  p  { @apply text-base leading-relaxed mb-4; }
  a  { @apply underline underline-offset-2 hover:opacity-70 transition-opacity; }
}
```

---

## Database Schema

### Users & Auth

```typescript
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  role: userRoleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Auth.js tables (accounts, sessions, verificationTokens) added when auth is wired up
```

### ACL / Permissions

```typescript
export const globalPermissionEnum = pgEnum('global_permission', [
  'event_approver',
  'content_editor',
]);

export const userPermissions = pgTable('user_permissions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  permission: globalPermissionEnum('permission').notNull(),
  grantedBy: text('granted_by').references(() => users.id),
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
});
```

### Events

```typescript
export const eventStatusEnum = pgEnum('event_status', [
  'draft', 'pending_review', 'approved', 'rejected', 'cancelled',
]);

export const events = pgTable('events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),       // Markdown
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
  ownerId: text('owner_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const eventEditorRoleEnum = pgEnum('event_editor_role', ['editor']);

export const eventEditors = pgTable('event_editors', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: eventEditorRoleEnum('role').default('editor').notNull(),
  invitedBy: text('invited_by').references(() => users.id),
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
});
```

### Gallery

```typescript
export const galleryImages = pgTable('gallery_images', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  url: text('url').notNull(),
  alt: text('alt'),
  caption: text('caption'),
  year: text('year'),
  sortOrder: real('sort_order').default(0),
  uploadedBy: text('uploaded_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Audit Log

```typescript
export const auditActionEnum = pgEnum('audit_action', [
  'event_created', 'event_updated', 'event_submitted',
  'event_approved', 'event_rejected', 'event_cancelled',
  'event_editor_added', 'event_editor_removed',
  'user_role_changed', 'user_permission_granted', 'user_permission_revoked',
  'gallery_image_added', 'gallery_image_removed',
]);

export const auditLog = pgTable('audit_log', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  action: auditActionEnum('action').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  targetType: text('target_type'),
  targetId: text('target_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## Access Control System

| Role/Permission | Description | Assigned How |
|---|---|---|
| **Admin** | Full access. | `users.role = 'admin'`. You + CEO David. |
| **Event Approver** | Approve/reject events. Gets email on submissions. | `user_permissions` row |
| **Content Editor** | Edit CMS content (future). | `user_permissions` row |
| **Event Owner** | Edit own event, invite editors, view audit log. | `events.ownerId = user.id` |
| **Event Editor** | Edit a specific event. | `event_editors` row |
| **Authenticated User** | Submit new events as draft. | Any logged-in user |
| **Anonymous** | View approved events, public pages, gallery. | No auth required |

### Permission Helpers

```typescript
function canEditEvent(userId, event) {
  return userIsAdmin(userId) || event.ownerId === userId || isEventEditor(userId, event.id);
}

function canApproveEvents(userId) {
  return userIsAdmin(userId) || hasPermission(userId, 'event_approver');
}
```

### Middleware Strategy
- `middleware.ts` protects `/dashboard/*` and `/admin/*` → redirect to `/sign-in`
- `/admin/layout.tsx` checks `role === 'admin'`
- Server Actions check granular permissions before mutating

---

## Event Lifecycle

```
[User fills form] → DRAFT
       |
[Submit for Review] → PENDING_REVIEW → [Email to approvers]
       |
[Approver]──── APPROVED ──→ [Email to owner, visible on calendar]
       |
       └──── REJECTED (with reason) ──→ [Email to owner, can edit & resubmit]

[Owner or Admin] → CANCELLED (any time)
```

Every state transition writes to `audit_log`.

---

## Key Technical Patterns

- **Default to Server Components.** Client Components only for forms, interactivity, useState/useEffect.
- **Server Actions** for mutations. **Direct Drizzle queries** in RSCs for reads.
- **API Route Handlers** exist for future React Native app — built incrementally.
- **Image upload:** `<input type="file">` → Vercel Blob via Server Action → store URL → display with `next/image`.
- **Slugs:** auto-generated from title, append `-2` for dupes, immutable after creation.
- **Errors:** `error.tsx` boundaries. Server Actions return `{ success, error?, data? }`. Zod on client + server.

---

## Email Templates (React Email + Resend)

1. **Magic Link** — "Sign in to Truckee Pride"
2. **Event Submitted** — To approvers
3. **Event Approved** — To owner
4. **Event Rejected** — To owner with reason
5. **Editor Invitation** — To invited user

---

## Pages Summary

| Area | Pages |
|---|---|
| **Public** | Homepage, Events list, Event detail, Gallery, MDX content, Get Involved, Donate (ext), Merch (ext) |
| **Auth** | Sign In, Verify |
| **Dashboard** | My Events, Create Event, Edit Event, Event Audit Log |
| **Admin** | Approval Queue, User Management, Gallery Management, Global Audit Log |

---

## Environment Variables

```env
DATABASE_URL=postgresql://...          # Neon (required from day 1)
AUTH_SECRET=                           # openssl rand -base64 32 (Phase 3+)
AUTH_URL=https://truckeepride.org      # Phase 3+
AUTH_RESEND_KEY=                       # Resend API key (Phase 3+)
EMAIL_FROM=auth@truckeepride.org       # Phase 3+
BLOB_READ_WRITE_TOKEN=                 # Vercel Blob (Phase 5+)
NEXT_PUBLIC_APP_URL=https://truckeepride.org
```

---

## Key Packages

```
next ^15, react ^19, react-dom ^19, drizzle-orm, drizzle-kit,
@neondatabase/serverless, next-auth ^5, @auth/drizzle-adapter,
resend, @react-email/components, @vercel/blob,
zod ^3, tailwindcss ^4, turbo ^2, typescript ^5, react-markdown
```

---

## Useful Commands

```bash
turbo dev                    # All apps        turbo dev --filter=web    # Web only
npx drizzle-kit generate     # Gen migration   npx drizzle-kit migrate   # Apply
npx drizzle-kit studio       # Visual DB       turbo build / turbo lint
pnpm add <pkg> --filter=web  # Add to web      pnpm add -D <pkg> -w      # Root dev dep
```

---

## Future (V2+)

Interactive calendar, React Native app (Expo `apps/mobile`), push notifications, CMS editor UI (Keystatic/Sanity), RSVP tracking, recurring events, sponsor DB, volunteer management, i18n, dark mode.
