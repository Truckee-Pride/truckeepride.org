import type { MetadataRoute } from 'next'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events } from '@/db/schema'

const BASE_URL = 'https://truckeepride.org'

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE_URL, changeFrequency: 'weekly', priority: 1.0 },
  { url: `${BASE_URL}/events`, changeFrequency: 'daily', priority: 0.9 },
  { url: `${BASE_URL}/donate`, changeFrequency: 'monthly', priority: 0.7 },
  {
    url: `${BASE_URL}/business-guide`,
    changeFrequency: 'monthly',
    priority: 0.5,
  },
  {
    url: `${BASE_URL}/lgbtq-engagement-and-mental-health-in-truckee`,
    changeFrequency: 'monthly',
    priority: 0.5,
  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const approvedEvents = await db.query.events.findMany({
    where: eq(events.status, 'approved'),
    columns: { slug: true, updatedAt: true },
  })

  const eventPages: MetadataRoute.Sitemap = approvedEvents.map((event) => ({
    url: `${BASE_URL}/events/${event.slug}`,
    lastModified: event.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...STATIC_PAGES, ...eventPages]
}
