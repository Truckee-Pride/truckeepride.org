import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <section>
        <h1>Truckee Pride Week 2026</h1>
        <p>May 30th &ndash; June 7th</p>
        <Link href="/donate">Donate to Truckee Pride!</Link>
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

      {/* [TODO: SPONSORS] */}

      <footer>
        <nav aria-label="Footer navigation">
          <ul>
            <li>
              <Link href="/">Truckee Pride</Link>
            </li>
            <li>
              <Link href="/donate">Donate</Link>
            </li>
            <li>
              <a href="mailto:hello@truckeepride.org">Get in touch</a>
            </li>
            <li>
              <a href="https://chat.whatsapp.com/L9a8ogUvcbP2FieSIrMT1Z">
                Join our WhatsApp
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/truckeepride">Instagram</a>
            </li>
            <li>
              <Link href="/business-guide">Business Guide</Link>
            </li>
            <li>
              <Link href="/lgbtq-engagement-and-mental-health-in-truckee">
                Mental health
              </Link>
            </li>
            <li>
              <a href="https://www.canva.com/design/DAF-NFd991g/p5CqdBbERNwJZJ2Y5ex0Sg/view">
                Suicide Prevention
              </a>
            </li>
          </ul>
        </nav>
        <p>
          Truckee Tahoe Pride Foundation is a registered 501(c)3 non-profit. EIN
          994735689
        </p>
        <p>
          Looking for the Wolverines? Visit{' '}
          <a href="https://truckeepride.com">TruckeePride.com</a>
        </p>
      </footer>
    </main>
  )
}
