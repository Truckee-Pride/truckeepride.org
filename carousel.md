# Plan: Admin-Managed Photo Carousel

## Context

This is a Next.js 15 App Router project for Truckee Pride, a small LGBTQ+ nonprofit. Read `CLAUDE.md` before starting. This plan covers adding a database-backed photo carousel to the homepage with an admin UI for managing images.

**Key conventions:**

- Tailwind v4, CSS-first config in `src/app/globals.css`. Use `cn()` for conditional classes.
- Custom color tokens: `text-brand`, `text-muted`, `text-foreground`, `bg-surface`, `bg-brand`, `border-border`, `text-inverse`.
- `LayoutWidth` from `src/lib/constants.ts` for page widths.
- Never use bare `<button>`, `<input>`, etc. — use components from `.claude/components.md`.
- Single quotes, no semicolons.
- Server Components are default. Only add `"use client"` when needed.
- Server Actions for all mutations. Every Server Action file starts with `"use server"`.

---

## Task 1 — Database schema for carousel photos

**File:** `src/db/schema/carousel.ts` (new)

Create a `carousel_photos` table following the same patterns as existing schema files (`events.ts`, `users.ts`):

```ts
import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const carouselPhotos = pgTable('carousel_photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  src: text('src').notNull(), // Vercel Blob URL
  alt: text('alt').notNull(), // Alt text for accessibility
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})
```

**Then:**

1. Export from `src/db/schema/index.ts`: add `export * from './carousel'`
2. Generate migration: `npx drizzle-kit generate`
3. Apply migration: `npx drizzle-kit migrate`

---

## Task 2 — Seed the database with existing carousel images

**Goal:** Download the 9 community photos currently on truckeepride.org's carousel, upload them to Vercel Blob, and insert them into the `carousel_photos` table.

Create a one-time seed script at `scripts/seed-carousel.ts` that:

1. Downloads each image from the Webflow CDN
2. Uploads it to Vercel Blob via the `@vercel/blob` server SDK (`put()`)
3. Inserts a row into `carousel_photos` with the Blob URL, alt text, and sort order

**Current truckeepride.org carousel images** (all 9):

1. `https://cdn.prod.website-files.com/65ce742373106d87447625dd/6668921bff362d66a74bbc2f_DC7E039A-C900-42F0-B9C1-DC3AE17EF88C.jpeg`
2. `https://cdn.prod.website-files.com/65ce742373106d87447625dd/6668921b5d7f9d8cebad02b4_IMG_7908.jpeg`
3. `https://cdn.prod.website-files.com/65ce742373106d87447625dd/6668921bc7b5363414c93c00_21fc3903fd7311bbad4cf7baafe5c97d_IMG_2428.jpg`
4. `https://cdn.prod.website-files.com/65ce742373106d87447625dd/6668921ae98297857c0fb9cf_IMG_0722.jpeg`
5. `https://cdn.prod.website-files.com/65ce742373106d87447625dd/6668921a3065d8f04654bf75_IMG_0799.jpeg`
6. `https://cdn.prod.website-files.com/65ce742373106d87447625dd/6668921a30d91697996e36d6_D70AC709-1071-46D7-B89D-862E4AC47344.jpeg`
7. `https://cdn.prod.website-files.com/65ce742373106d87447625dd/6668921a5057d3f2189c6a4a_6010f5cb-c818-4b7c-8c49-98e37846903b.jpeg`
8. `https://cdn.prod.website-files.com/65ce742373106d87447625dd/66689219d9b9a9c4140c3481_IMG_2456.jpeg`
9. `https://cdn.prod.website-files.com/65ce742373106d87447625dd/6668921ad9b9a9c4140c34e5_dc0b544e845dbb63fe91d97b051c09a9_IMG_2603.png`

Download each, upload to Vercel Blob, and insert into DB. The user will add alt text later from the Admin UI.

**Script implementation:**

```ts
// scripts/seed-carousel.ts
import { put } from '@vercel/blob'
import { db } from '@/db'
import { carouselPhotos } from '@/db/schema'

async function seed() {
  for (let i = 0; i < SEED_IMAGES.length; i++) {
    const { url, alt } = SEED_IMAGES[i]
    const filename = `carousel/${url.split('/').pop()}`

    // Download from CDN
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()

    // Upload to Vercel Blob
    const blob = await put(filename, Buffer.from(buffer), {
      access: 'public',
      addRandomSuffix: false,
    })

    // Insert into DB
    await db.insert(carouselPhotos).values({
      src: blob.url,
      alt,
      sortOrder: i,
    })

    console.log(`Uploaded ${i + 1}/${SEED_IMAGES.length}: ${blob.url}`)
  }
  console.log('Done!')
}

seed().catch(console.error)
```

**Run with:** `npx tsx scripts/seed-carousel.ts`

This requires `BLOB_READ_WRITE_TOKEN` and `DATABASE_URL` in `.env.local`. Both should already be set.

---

## Task 3 — Public carousel component

**File:** `src/components/PhotoCarousel.tsx` (new, `'use client'`)

This component renders the carousel on the homepage. It receives photos as props (fetched server-side).

**Props:**

```ts
type CarouselPhoto = {
  id: string
  src: string
  alt: string
}

type Props = {
  photos: CarouselPhoto[]
}
```

**Behavior:**

- Display one image at a time with previous/next arrow controls
- Auto-advance every 5 seconds (reset timer on manual navigation)
- Dot indicators: small circles, clickable, filled for current
- Image: use Next.js `<Image />` with `fill` layout inside a fixed-height container
- Height: 300px on mobile, 400px on `sm:`+
- Rounded corners: `rounded-xl`
- Object-fit: `cover`
- Previous/Next buttons: use `<button>` with `aria-label` (icon-only controls are the exception to the no-bare-button rule)
- If `photos` is empty, render nothing

### Add to homepage

**File:** `src/app/page.tsx`

Fetch carousel photos server-side:

```ts
import { db } from '@/db'
import { carouselPhotos } from '@/db/schema'
import { asc } from 'drizzle-orm'

// In the page component:
const photos = await db
  .select({
    id: carouselPhotos.id,
    src: carouselPhotos.src,
    alt: carouselPhotos.alt,
  })
  .from(carouselPhotos)
  .orderBy(asc(carouselPhotos.sortOrder))
```

Place `<PhotoCarousel photos={photos} />` in a new `<section>` after the events calendar section.

Ensure Vercel Blob domain is in `next.config.ts` `images.remotePatterns`. The Blob domain pattern is `*.public.blob.vercel-storage.com`. Check `next.config.ts` — it may already be configured.

---

## Task 4 — Admin carousel management page

**File:** `src/app/admin/carousel/page.tsx` (new)

This is the admin UI for managing carousel photos. It has two parts:

1. **Add new photo** — uses the existing `ImageUpload` component
2. **Reorder/delete existing photos** — drag-and-drop thumbnail grid

### Page structure (Server Component shell + Client Component for interactivity)

```
src/app/admin/carousel/
  page.tsx          — Server Component: fetch photos, render AdminCarousel
  AdminCarousel.tsx — Client Component: drag-and-drop + upload UI
  actions.ts        — Server Actions: add, reorder, delete
```

### `page.tsx` (Server Component)

```tsx
import { db } from '@/db'
import { carouselPhotos } from '@/db/schema'
import { asc } from 'drizzle-orm'
import { AdminCarousel } from './AdminCarousel'

export default async function CarouselAdminPage() {
  const photos = await db
    .select()
    .from(carouselPhotos)
    .orderBy(asc(carouselPhotos.sortOrder))

  return (
    <div>
      <h1>Carousel Photos</h1>
      <AdminCarousel initialPhotos={photos} />
    </div>
  )
}
```

### `AdminCarousel.tsx` (Client Component)

**Two sections:**

#### Section 1: Add new photo

Use the existing `ImageUpload` component (`src/components/forms/ImageUpload.tsx`):

```tsx
const imageUploadRef = useRef<ImageUploadHandle>(null)

<ImageUpload
  ref={imageUploadRef}
  name="photo"
  label="Add a new carousel photo"
/>

<Input
  name="alt"
  label="Alt text (describe the photo)"
  // ... standard text input from form components
/>

<Button onClick={handleAdd}>Add Photo</Button>
```

The `handleAdd` function:

1. Calls `imageUploadRef.current.upload()` to upload to Vercel Blob (reuses existing upload flow)
2. Calls the `addCarouselPhoto` server action with the blob URL and alt text
3. Refreshes the photo list via `router.refresh()`

#### Section 2: Reorder photos with drag and drop

Display a grid of thumbnails that can be reordered via drag and drop.

**Implementation — use native HTML drag and drop API:**

```tsx
// Each thumbnail is a draggable card
<div
  draggable
  onDragStart={handleDragStart(index)}
  onDragOver={handleDragOver}
  onDrop={handleDrop(index)}
  onDragEnd={handleDragEnd}
  className="relative cursor-grab active:cursor-grabbing"
>
  <img src={photo.src} alt={photo.alt} className="h-24 w-36 rounded-md object-cover" />
  <span className="absolute top-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
    {index + 1}
  </span>
  <button aria-label={`Delete ${photo.alt}`} onClick={handleDelete(photo.id)}>
    <!-- X icon -->
  </button>
</div>
```

**Drag and drop state:**

- `dragIndex`: which item is being dragged
- `photos`: local state array, reordered on drop
- On drop: rearrange the local array, then call `reorderCarouselPhotos` server action with the new ID order
- Visual feedback: show a border/highlight on the drop target

**Delete:** Each thumbnail has a small X button. On click, confirm with `window.confirm()`, then call `deleteCarouselPhoto` server action.

### `actions.ts` (Server Actions)

```ts
'use server'

import { db } from '@/db'
import { carouselPhotos } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth-stub'
import { del } from '@vercel/blob'

export async function addCarouselPhoto(src: string, alt: string) {
  const user = await getCurrentUser()
  if (user?.role !== 'admin') return { success: false, error: 'Unauthorized' }

  // Get max sort order
  const existing = await db
    .select({ sortOrder: carouselPhotos.sortOrder })
    .from(carouselPhotos)
    .orderBy(desc(carouselPhotos.sortOrder))
    .limit(1)

  const nextOrder = existing.length ? existing[0].sortOrder + 1 : 0

  await db.insert(carouselPhotos).values({ src, alt, sortOrder: nextOrder })
  revalidatePath('/')
  revalidatePath('/admin/carousel')
  return { success: true }
}

export async function reorderCarouselPhotos(orderedIds: string[]) {
  const user = await getCurrentUser()
  if (user?.role !== 'admin') return { success: false, error: 'Unauthorized' }

  // Update sort_order for each photo based on array position
  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx
        .update(carouselPhotos)
        .set({ sortOrder: i })
        .where(eq(carouselPhotos.id, orderedIds[i]))
    }
  })

  revalidatePath('/')
  revalidatePath('/admin/carousel')
  return { success: true }
}

export async function deleteCarouselPhoto(id: string) {
  const user = await getCurrentUser()
  if (user?.role !== 'admin') return { success: false, error: 'Unauthorized' }

  // Get the photo to delete the blob
  const [photo] = await db
    .select({ src: carouselPhotos.src })
    .from(carouselPhotos)
    .where(eq(carouselPhotos.id, id))

  if (photo) {
    // Delete from Vercel Blob (if it's a blob URL)
    const { isBlobUrl } = await import('@/lib/upload')
    if (isBlobUrl(photo.src)) {
      await del(photo.src)
    }
    await db.delete(carouselPhotos).where(eq(carouselPhotos.id, id))
  }

  revalidatePath('/')
  revalidatePath('/admin/carousel')
  return { success: true }
}
```

---

## Task 5 — Add admin nav link

Add a "Carousel" link to the admin navigation (wherever admin nav links are rendered — check `src/app/admin/layout.tsx` or similar). Link to `/admin/carousel`.

---

## Verification steps

```bash
pnpm lint
pnpm typecheck
pnpm build
```

All must pass with zero errors or warnings.

**Manual checks (`pnpm dev`):**

1. Run seed script — images appear in DB (check via Drizzle Studio)
2. Homepage carousel: auto-advances, manual nav works, dots update, images load from Vercel Blob
3. Admin carousel page: can add new photo via ImageUpload, alt text field works
4. Admin carousel page: can drag thumbnails to reorder, order persists after refresh
5. Admin carousel page: can delete a photo, removed from homepage carousel
6. Admin carousel page: sort order numbers on thumbnails reflect current order

## Done

Delete these items from `TODOLIST.md` when all verification steps pass:

- "Bring back the photo carousel to the homepage! Put it below the calendar"
- "Make it easy for admins to edit the photo carousel image options"
