# Plan: Implement MVP.2.4 through MVP.2.11 (Core Auth)

## Context

The project has Auth.js v5 fully configured (`src/lib/auth.ts`) with Resend magic link provider and Drizzle adapter, but the app still uses a hardcoded dev stub (`src/lib/auth-stub.ts`) everywhere. No sign-in page, middleware, or auth UI exists. This batch wires up real auth end-to-end so you can test sign-in, route protection, and permission checks before tackling the multi-step flow (MVP.2.12) separately.

**Prerequisite (manual):** MVP.2.0 — Resend API key + AUTH_SECRET must be in `.env.local`.

---

## Batch scope: MVP.2.4 – MVP.2.11

### 1. MVP.2.4 — Replace auth stub with real `auth()` session

**File:** `src/lib/auth-stub.ts` (rename/replace)

- Export `getCurrentUser(): Promise<User | null>` — calls `auth()` from `src/lib/auth.ts`, returns `session.user` mapped to `User` type, or `null`
- Export `requireUser(): Promise<User>` — calls `getCurrentUser()`, if null → `redirect('/sign-in')`
- Update all imports of `getCurrentUser` across the codebase (server actions, pages, API routes) to use the new module
- `canEditEvent` in `permissions.ts` already accepts `User` — no change needed there, but callers must handle the `null` case from `getCurrentUser`

### 2. MVP.2.5 — Sign-in page `/sign-in`

**File:** `src/app/sign-in/page.tsx`

- Email input form using `Input` component from `src/components/forms/`
- Submit calls `signIn('resend', { email, redirectTo })` server action from Auth.js
- Accept `callbackUrl` search param for post-auth redirect
- Simple, branded page with Truckee Pride heading

### 3. MVP.2.6 — Verify page `/verify`

**File:** `src/app/verify/page.tsx`

- "Check your email" message with instructions
- Accept `?email=...&event=...` search params
- When `event` param present: show event-aware messaging ("Once you verify, you'll review your event before it goes live.")
- Resend link (button that re-triggers sign-in)

### 4. MVP.2.7 — Auth middleware

**File:** `src/middleware.ts`

- Protect `/events/*/edit` and `/admin/*` → redirect to `/sign-in?callbackUrl=...`
- `/events/new` is **NOT** protected (unauthenticated multi-step flow)
- Use Auth.js `auth` export as middleware wrapper, or check session token cookie

### 5. MVP.2.8 — Admin layout guard

**File:** `src/app/admin/layout.tsx`

- Call `auth()` or `requireUser()` to get session
- If not admin → render 403 message (not redirect — they're authenticated but unauthorized)
- Keep existing `LayoutWidth.admin` wrapper

### 6. MVP.2.9 — Event visibility gating

**File:** `src/app/events/[slug]/page.tsx`

- Public statuses: `approved`, `cancelled`
- Non-public statuses (`pending_review`, `draft`, `rejected`): only visible to owner + admins
- Call `getCurrentUser()` (nullable), check permissions before rendering
- Fix `generateMetadata` to also gate — return `{}` for non-public events unless viewer is owner/admin

### 7. MVP.2.10 — Permission checks in server actions

**Files:** `src/app/events/new/actions.ts`, `src/app/admin/events/actions.ts`

- `submitEventForReview`: add ownership check — fetch event, verify `canEditEvent(user, event)`
- `approveEvent` / `rejectEvent` / `deleteEvent`: already check admin role, just swap stub import → real auth
- `createEvent`: swap stub import, handle null user (redirect to sign-in)

### 8. MVP.2.11 — Header nav with auth UI (minimal)

**File:** `src/app/Header.tsx`

- Only show nav when logged in
- For now, just a "Sign out" link (more nav links to be added later)
- Use `getCurrentUser()` to check auth state
- Sign Out uses Auth.js `signOut` action

---

## Files to modify

| File                                    | Change                                                          |
| --------------------------------------- | --------------------------------------------------------------- |
| `src/lib/auth-stub.ts`                  | Rewrite with real `auth()` + `requireUser()`                    |
| `src/app/sign-in/page.tsx`              | **New** — sign-in form                                          |
| `src/app/verify/page.tsx`               | **New** — check-your-email page                                 |
| `src/middleware.ts`                     | **New** — route protection                                      |
| `src/app/admin/layout.tsx`              | Add admin role guard                                            |
| `src/app/events/[slug]/page.tsx`        | Visibility gating for non-public events                         |
| `src/app/events/new/actions.ts`         | Swap auth import, add ownership check to `submitEventForReview` |
| `src/app/admin/events/actions.ts`       | Swap auth import                                                |
| `src/app/events/[slug]/edit/actions.ts` | Swap auth import                                                |
| `src/app/Header.tsx`                    | Add nav with auth-aware links                                   |
| `src/app/api/upload/route.ts`           | Swap auth import                                                |

---

## Pre-implementation: TODOLIST update

Add **MVP.2.13 Edit Profile** — page at `/profile/edit` where users can update their name/email/etc. (to be specced later).

---

## What's NOT in this batch

- **MVP.2.0** (Resend setup) — manual env var step, must be done before testing
- **MVP.2.12** (multi-step event submission flow) — complex, 7+ new files + DB migration; next batch
- **MVP.2.13** (Edit Profile page) — added to TODOLIST, to be specced and implemented later

---

## Verification

1. `pnpm typecheck` — no type errors
2. `pnpm lint` — no lint warnings
3. `pnpm build` — clean build
4. Manual testing (requires Resend API key in `.env.local`):
   - Visit `/sign-in`, enter email, receive magic link
   - Follow link → authenticated, redirected
   - Visit `/admin/events` as non-admin → 403
   - Visit `/events/[pending-slug]` as non-owner → 404
   - Header shows "Sign out" when logged in
   - Sign out works
