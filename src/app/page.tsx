import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <Link href="/donate">Donate to Truckee Pride!</Link>
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
        <p>
          <a href="https://forms.gle/F6i12Jwj4LK2kZyC7">
            Have fun and give back by volunteering!
          </a>
        </p>

        <h2>[TODO: EVENTS GO HERE]</h2>
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
        <p>[TODO: SPONSORS]</p>
      </section>
    </main>
  )
}
