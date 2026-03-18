'use server'

import { db } from '@/lib/db'
import { carouselPhotos } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth-stub'
import { del } from '@vercel/blob'
import { isBlobUrl } from '@/lib/upload'

export async function addCarouselPhoto(src: string, alt: string) {
  const user = await getCurrentUser()
  if (user?.role !== 'admin')
    return { success: false as const, error: 'Unauthorized' }

  const existing = await db
    .select({ sortOrder: carouselPhotos.sortOrder })
    .from(carouselPhotos)
    .orderBy(desc(carouselPhotos.sortOrder))
    .limit(1)

  const nextOrder = existing.length ? existing[0].sortOrder + 1 : 0

  await db.insert(carouselPhotos).values({ src, alt, sortOrder: nextOrder })
  revalidatePath('/')
  revalidatePath('/admin/carousel')
  return { success: true as const }
}

export async function reorderCarouselPhotos(orderedIds: string[]) {
  const user = await getCurrentUser()
  if (user?.role !== 'admin')
    return { success: false as const, error: 'Unauthorized' }

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
  return { success: true as const }
}

export async function deleteCarouselPhoto(id: string) {
  const user = await getCurrentUser()
  if (user?.role !== 'admin')
    return { success: false as const, error: 'Unauthorized' }

  const [photo] = await db
    .select({ src: carouselPhotos.src })
    .from(carouselPhotos)
    .where(eq(carouselPhotos.id, id))

  if (photo) {
    if (isBlobUrl(photo.src)) {
      await del(photo.src)
    }
    await db.delete(carouselPhotos).where(eq(carouselPhotos.id, id))
  }

  revalidatePath('/')
  revalidatePath('/admin/carousel')
  return { success: true as const }
}
