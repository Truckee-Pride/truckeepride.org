import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { carouselPhotos } from '@/db/schema'
import { PageHeader } from '@/components/PageHeader'
import { AdminCarousel } from './AdminCarousel'

export default async function CarouselAdminPage() {
  const photos = await db
    .select()
    .from(carouselPhotos)
    .orderBy(asc(carouselPhotos.sortOrder))

  return (
    <>
      <PageHeader title="Carousel Photos" />
      <AdminCarousel initialPhotos={photos} />
    </>
  )
}
