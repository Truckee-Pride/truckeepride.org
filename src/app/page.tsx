import Link from 'next/link'
import { and, asc, eq, gte } from 'drizzle-orm'
import { LayoutWidth } from '@/lib/constants'
import { db } from '@/lib/db'
import { events, sponsors, carouselPhotos } from '@/db/schema'
import { EventCard } from '@/components/EventCard'
import { PhotoCarousel } from '@/components/PhotoCarousel'
import { Button } from '@/components/Button'
import { SponsorLogo } from '@/components/SponsorLogo'
import { DONATE_BUTTON_TEXT } from '@/lib/constants'

const sponsorsGridClasses = 'grid grid-cols-2 gap-8 sm:grid-cols-3'

export default async function Home() {
  const [upcomingEvents, sponsorsList, photos] = await Promise.all([
    db.query.events.findMany({
      where: and(
        eq(events.status, 'approved'),
        gte(events.startTime, new Date()),
      ),
      orderBy: asc(events.startTime),
      limit: 5,
    }),
    db
      .select()
      .from(sponsors)
      .where(eq(sponsors.enabled, true))
      .orderBy(asc(sponsors.name)),
    db
      .select({
        id: carouselPhotos.id,
        src: carouselPhotos.src,
        alt: carouselPhotos.alt,
      })
      .from(carouselPhotos)
      .orderBy(asc(carouselPhotos.sortOrder)),
  ])

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
        <PhotoCarousel photos={photos} />
      </section>

      {sponsorsList.length > 0 && (
        <section>
          <h2>Thank you to our sponsors!</h2>
          <p>
            Truckee Pride is an entirely volunteer and sponsor supported
            organization. Thank you to all the organizations below for kindly
            supporting us:
          </p>
          <div className={sponsorsGridClasses}>
            {sponsorsList.map((sponsor) => (
              <div
                key={sponsor.id}
                className="flex items-center justify-center py-2"
              >
                <SponsorLogo
                  name={sponsor.name}
                  imageUrl={sponsor.imageUrl}
                  externalUrl={sponsor.externalUrl}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
