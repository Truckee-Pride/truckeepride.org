import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '@/db/schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function seed() {
  const existing = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, 'dev-user-id'),
  })

  if (existing) {
    console.log('Dev user already exists, skipping.')
    return
  }

  await db.insert(schema.users).values({
    id: 'dev-user-id',
    name: 'Dev Admin',
    email: 'dev@truckeepride.org',
    role: 'admin',
  })

  console.log('Dev user seeded.')
}

seed().catch(console.error)
