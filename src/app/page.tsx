import Image from 'next/image'
import Link from 'next/link'
import { and, asc, eq, gte } from 'drizzle-orm'
import { LayoutWidth } from '@/lib/constants'
import { db } from '@/lib/db'
import { events } from '@/db/schema'
import { EventCard } from '@/components/EventCard'
import { Button } from '@/components/Button'
import { DONATE_BUTTON_TEXT } from '@/lib/constants'

const sponsors = [
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/68372b2a43203a02f9310ba1_eagle.webp',
    alt: 'Palisades Tahoe',
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/68007d756034fa5117407554_tahoe-donner-logo-2000px.png',
    alt: 'Tahoe Donner',
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/68007c57273dd8ba51f0d6b4_truckee-logo.svg',
    alt: 'Town of Truckee',
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/682b87d2b329cb13967af7f8_Pacos%20Secondary%20Script%20Logo%20F1.png',
    alt: "Paco's",
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/6668912fc6bef6fb40ba830f_Screenshot%202024-06-11%20at%2011.00.47%E2%80%AFAM.png',
    alt: 'The UPS Store',
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/681bac19599421f51470c247_Fulllogo.png',
    alt: 'Dreamtown CrossFit',
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/680aaf63eb514c0dd8920201_Primary%20Tahoe%20Modern%20Blue%20(3).png',
    alt: 'Tahoe Modern',
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/680aaf9ca0d5d2e97e74a61e_TNT%20Pride%20Logo.png',
    alt: 'TNT Pride',
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/66196c1e462acfb2d388edef_TCD-Logo-FullColor%20(1).png',
    alt: 'Truckee Cultural District',
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/6838c05d3c2531c40c67f737_WhatsApp%20Image%202025-05-24%20at%2015.40.26.jpeg',
    alt: 'Truckee Gymnastics',
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/6823a7bc747da816449f5b01_images.png',
    alt: 'Pacific Crest Coffee Co.',
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/6600e45b3a2b81f75fd0be9f_image.png',
    alt: 'Tahoe Print Shop',
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/68007ab13f483a200fb91720_GO%20Logo%20Round_With%20Background%20(1).jpg',
    alt: 'Grocery Outlet Bargain Market',
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/68007ccdb027fa84b0f9ee9e_Raleys_RGB-1.png',
    alt: "Raley's",
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/68007c1fe93343e3455f372b_visit-truckee-tahoe.svg',
    alt: 'Visit Truckee Tahoe',
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/681bac4a0e0802157c09583a_IMG_0672.png',
    alt: 'Kidzone Museum',
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/65df7639c337d845f1a33402_Church%20of%20the%20Mountains%20Logo.%20Transparent.png',
    alt: 'Church of the Mountains',
  },
  {
    src: 'https://cdn.prod.website-files.com/65ce7daae11b51852ee387db/65fa0fa21dedf54099b1a484_637674363286330000.png',
    alt: 'Town of Truckee',
  },
]

export default async function Home() {
  const upcomingEvents = await db.query.events.findMany({
    where: and(
      eq(events.status, 'approved'),
      gte(events.startTime, new Date()),
    ),
    orderBy: asc(events.startTime),
    limit: 5,
  })

  return (
    <main className={LayoutWidth.wide}>
      <section className="flex justify-center">
        <Button href="/donate">{DONATE_BUTTON_TEXT}</Button>
      </section>

      <section>
        <h2>Our Mission</h2>
        <p>
          We&apos;re a grass-roots volunteer-run organization working to make
          everyone feel welcomed and at home in the mountains.
        </p>
        <p>
          We love living and playing in the incredible landscape of the Sierra
          Nevada. Historically, rural towns and outdoor spaces haven&apos;t
          always been accepting of the queer community. We&apos;re working to
          make sure that regardless of sexual orientation, gender identity, race
          and lifestyle, everybody feels safe, supported and welcome in the
          Truckee area.
        </p>
        <p>
          Truckee Tahoe Pride Foundation is a registered 501(c)3 non-profit.
        </p>
      </section>

      <section>
        <a
          href="https://forms.gle/F6i12Jwj4LK2kZyC7"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded px-3.5 py-4"
          style={{
            backgroundImage:
              'url(https://cdn.prod.website-files.com/65ce742373106d87447625dd/681e386695f5c7d43dcbf8e7_rainbow.png)',
            backgroundPosition: '50%',
            backgroundSize: 'cover',
          }}
        >
          <h3 className="m-0">🙌 Have fun and give back by volunteering!</h3>
        </a>
      </section>

      <section>
        <h2>Events Calendar</h2>
        <p>
          Because this is Truckee, we&apos;ve extended our calendar to include
          ski season as well as Pride Week! Want to organize an event?{' '}
          <a href="mailto:hello@truckeepride.org">Get in touch</a>.
        </p>
        <p>
          All of our events are family-friendly and welcoming of non-LGBTQIA+
          folks. Our goal is to bring our town together for fun and community
          building.
        </p>

        {upcomingEvents.length === 0 ? (
          <p className="text-muted">No upcoming events — check back soon!</p>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
            {upcomingEvents.map((event, i) => (
              <EventCard key={event.id} event={event} colorIndex={i} />
            ))}
          </div>
        )}
        <div className="mt-8">
          <Link href="/events">View all events →</Link>
        </div>
      </section>

      <section>
        <h2>Looking for somewhere to stay?</h2>
        <p>
          Thanks to our partners at Visit Truckee Tahoe,{' '}
          <a href="https://lodging.visittruckeetahoe.com">
            you can search and book Truckee Lodging through their site
          </a>
          .
        </p>
      </section>
      <section>
        <h2>Thank you to our sponsors!</h2>
        <p>
          Truckee Pride is an entirely volunteer and sponsor supported
          organization. Thank you to all the organizations below for kindly
          supporting us:
        </p>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.src}
              className="flex items-center justify-center py-2"
            >
              <Image
                src={sponsor.src}
                alt={sponsor.alt}
                width={120}
                height={120}
                className="h-auto w-full max-w-[120px]"
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
