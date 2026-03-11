import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { like } from 'drizzle-orm'

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export async function ensureUniqueSlug(base: string): Promise<string> {
  const existing = await db
    .select({ slug: events.slug })
    .from(events)
    .where(like(events.slug, `${base}%`))

  const slugs = new Set(existing.map((r) => r.slug))

  if (!slugs.has(base)) return base

  let i = 2
  while (slugs.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}
