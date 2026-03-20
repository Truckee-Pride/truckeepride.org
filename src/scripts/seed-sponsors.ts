/**
 * Seeds the sponsors table with the 3 original hardcoded sponsors.
 * Downloads each image from its CDN URL, uploads to Vercel Blob, and inserts a DB row.
 *
 * Run with: npx dotenv -e .env.local -- tsx src/scripts/seed-sponsors.ts
 */
import { put, list } from '@vercel/blob'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '@/db/schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const SPONSORS = [
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/66196c1e462acfb2d388edef_TCD-Logo-FullColor%20(1).png',
    alt: 'Truckee Cultural District',
    filename: 'tcd-logo.png',
    sortOrder: 0,
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/65df7639c337d845f1a33402_Church%20of%20the%20Mountains%20Logo.%20Transparent.png',
    alt: 'Church of the Mountains',
    filename: 'church-of-the-mountains-logo.png',
    sortOrder: 1,
  },
  {
    src: 'https://cdn.brandfetch.io/idEhX7aFK4/w/820/h/500/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1750540338911',
    alt: "Arc'teryx",
    filename: 'arcteryx-logo.png',
    sortOrder: 2,
  },
]

async function seedSponsors() {
  const existing = await db.query.sponsors.findMany()
  if (existing.length > 0) {
    console.log(`Sponsors table already has ${existing.length} rows, skipping.`)
    return
  }

  for (const sponsor of SPONSORS) {
    const blobPath = `sponsors/${sponsor.filename}`
    let blobUrl: string

    // Reuse existing blob if already uploaded, otherwise download and upload
    const existing = await list({ prefix: blobPath })
    const found = existing.blobs.find((b) => b.pathname === blobPath)
    if (found) {
      console.log(`Blob already exists for ${sponsor.alt}, reusing.`)
      blobUrl = found.url
    } else {
      console.log(`Downloading ${sponsor.alt}...`)
      const response = await fetch(sponsor.src)
      if (!response.ok) {
        throw new Error(
          `Failed to download ${sponsor.src}: ${response.statusText}`,
        )
      }
      const buffer = await response.arrayBuffer()

      console.log(`Uploading ${sponsor.filename} to Vercel Blob...`)
      const blob = await put(blobPath, buffer, {
        access: 'public',
        contentType: response.headers.get('content-type') ?? 'image/png',
      })
      blobUrl = blob.url
    }

    console.log(`Inserting ${sponsor.alt} into DB...`)
    await db.insert(schema.sponsors).values({
      imageUrl: blobUrl,
      name: sponsor.alt,
      sortOrder: sponsor.sortOrder,
    })

    console.log(`  ✓ ${sponsor.alt} → ${blobUrl}`)
  }

  console.log('Done seeding sponsors.')
}

seedSponsors().catch(console.error)
