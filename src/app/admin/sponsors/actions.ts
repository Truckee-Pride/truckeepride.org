'use server'

import { del, put } from '@vercel/blob'
import { and, eq, ne, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth-stub'
import { db } from '@/lib/db'
import { sponsors } from '@/db/schema'
import { isBlobUrl } from '@/lib/upload'

export async function addSponsor(formData: FormData) {
  const user = await requireUser()
  if (user.role !== 'admin') return { success: false, error: 'Unauthorized' }

  const imageUrl = formData.get('imageUrl')?.toString().trim() ?? ''
  const name = formData.get('name')?.toString().trim() ?? ''
  const externalUrlField = formData.get('externalUrl')?.toString().trim()
  const externalUrl = externalUrlField?.length ? externalUrlField : null

  if (!imageUrl)
    return { success: false, fieldErrors: { image: ['Image is required'] } }
  if (!name)
    return {
      success: false,
      fieldErrors: { name: ['Sponsor name is required'] },
    }

  const existing = await db
    .select({ id: sponsors.id })
    .from(sponsors)
    .where(sql`lower(trim(${sponsors.name})) = lower(trim(${name}))`)
    .limit(1)
  if (existing.length > 0)
    return {
      success: false,
      fieldErrors: { name: ['A sponsor with that name already exists'] },
    }

  await db
    .insert(sponsors)
    .values({ imageUrl, name, externalUrl, sortOrder: 0 })

  revalidatePath('/admin/sponsors')
  revalidatePath('/')
  return { success: true }
}

export async function deleteSponsor(id: number) {
  const user = await requireUser()
  if (user.role !== 'admin') return { success: false, error: 'Unauthorized' }

  const [sponsor] = await db
    .select()
    .from(sponsors)
    .where(eq(sponsors.id, id))
    .limit(1)

  if (!sponsor) return { success: false, error: 'Sponsor not found' }

  // Delete from Vercel Blob if the image is stored there
  if (isBlobUrl(sponsor.imageUrl)) {
    await del(sponsor.imageUrl)
  }

  await db.delete(sponsors).where(eq(sponsors.id, id))

  revalidatePath('/admin/sponsors')
  revalidatePath('/')
  return { success: true }
}

export async function toggleSponsor(id: number, enabled: boolean) {
  const user = await requireUser()
  if (user.role !== 'admin') return { success: false, error: 'Unauthorized' }

  await db.update(sponsors).set({ enabled }).where(eq(sponsors.id, id))

  revalidatePath('/admin/sponsors')
  revalidatePath('/')
  return { success: true }
}

export async function updateSponsorName(id: number, name: string) {
  const user = await requireUser()
  if (user.role !== 'admin') return { success: false, error: 'Unauthorized' }

  const trimmedName = name.trim()
  if (!trimmedName) {
    return { success: false, error: 'Sponsor name is required' }
  }

  const existing = await db
    .select({ id: sponsors.id })
    .from(sponsors)
    .where(
      and(
        sql`lower(trim(${sponsors.name})) = lower(trim(${trimmedName}))`,
        ne(sponsors.id, id),
      ),
    )
    .limit(1)
  if (existing.length > 0)
    return { success: false, error: 'A sponsor with that name already exists' }

  await db
    .update(sponsors)
    .set({ name: trimmedName })
    .where(eq(sponsors.id, id))

  revalidatePath('/admin/sponsors')
  revalidatePath('/')
  return { success: true }
}

export async function updateSponsorUrl(id: number, url: string) {
  const user = await requireUser()
  if (user.role !== 'admin') return { success: false, error: 'Unauthorized' }

  const externalUrl = url.trim() || null

  await db.update(sponsors).set({ externalUrl }).where(eq(sponsors.id, id))

  revalidatePath('/admin/sponsors')
  revalidatePath('/')
  return { success: true }
}

export async function uploadSponsorImage(formData: FormData) {
  const user = await requireUser()
  if (user.role !== 'admin') return { success: false, error: 'Unauthorized' }

  const file = formData.get('file')
  if (!(file instanceof File))
    return { success: false, error: 'No file provided' }

  const blob = await put(`sponsors/${file.name}`, file, { access: 'public' })
  return { success: true, url: blob.url }
}
