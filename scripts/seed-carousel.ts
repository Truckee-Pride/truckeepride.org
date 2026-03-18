import { config } from 'dotenv'
config({ path: '.env.local' })

import { put } from '@vercel/blob'
import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { carouselPhotos } from '../src/db/schema/carousel'

const SEED_IMAGES = [
  {
    url: 'https://cdn.prod.website-files.com/65ce742373106d87447625dd/6668921bff362d66a74bbc2f_DC7E039A-C900-42F0-B9C1-DC3AE17EF88C.jpeg',
    alt: 'Community photo 1',
  },
  {
    url: 'https://cdn.prod.website-files.com/65ce742373106d87447625dd/6668921b5d7f9d8cebad02b4_IMG_7908.jpeg',
    alt: 'Community photo 2',
  },
  {
    url: 'https://cdn.prod.website-files.com/65ce742373106d87447625dd/6668921bc7b5363414c93c00_21fc3903fd7311bbad4cf7baafe5c97d_IMG_2428.jpg',
    alt: 'Community photo 3',
  },
  {
    url: 'https://cdn.prod.website-files.com/65ce742373106d87447625dd/6668921ae98297857c0fb9cf_IMG_0722.jpeg',
    alt: 'Community photo 4',
  },
  {
    url: 'https://cdn.prod.website-files.com/65ce742373106d87447625dd/6668921a3065d8f04654bf75_IMG_0799.jpeg',
    alt: 'Community photo 5',
  },
  {
    url: 'https://cdn.prod.website-files.com/65ce742373106d87447625dd/6668921a30d91697996e36d6_D70AC709-1071-46D7-B89D-862E4AC47344.jpeg',
    alt: 'Community photo 6',
  },
  {
    url: 'https://cdn.prod.website-files.com/65ce742373106d87447625dd/6668921a5057d3f2189c6a4a_6010f5cb-c818-4b7c-8c49-98e37846903b.jpeg',
    alt: 'Community photo 7',
  },
  {
    url: 'https://cdn.prod.website-files.com/65ce742373106d87447625dd/66689219d9b9a9c4140c3481_IMG_2456.jpeg',
    alt: 'Community photo 8',
  },
  {
    url: 'https://cdn.prod.website-files.com/65ce742373106d87447625dd/6668921ad9b9a9c4140c34e5_dc0b544e845dbb63fe91d97b051c09a9_IMG_2603.png',
    alt: 'Community photo 9',
  },
]

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  const db = drizzle(pool)

  for (let i = 0; i < SEED_IMAGES.length; i++) {
    const { url, alt } = SEED_IMAGES[i]
    const filename = `carousel/${url.split('/').pop()}`

    const response = await fetch(url)
    const buffer = await response.arrayBuffer()

    const blob = await put(filename, Buffer.from(buffer), {
      access: 'public',
      addRandomSuffix: false,
    })

    await db.insert(carouselPhotos).values({
      src: blob.url,
      alt,
      sortOrder: i,
    })

    console.log(`Uploaded ${i + 1}/${SEED_IMAGES.length}: ${blob.url}`)
  }

  console.log('Done!')
  await pool.end()
}

seed().catch(console.error)
