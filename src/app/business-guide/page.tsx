import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Business Guide',
  description:
    'Partner with Truckee Pride to show your support for the LGBTQ+ community. Sponsorship tiers, participation options, and marketing benefits.',
}

export default function BusinessGuidePage() {
  return (
    <main className="max-w-2xl px-8 py-12">
      <h1>Business Guide</h1>

      <p className="mt-4">
        Partnering with Truckee Pride is a meaningful way to show your business
        supports the LGBTQ+ community in the Sierra Nevada. You&apos;ll gain
        visibility across our marketing channels and connect with a loyal,
        values-driven audience.
      </p>

      <h2 className="mt-10">Benefits of Participation</h2>
      <ul className="mt-4 space-y-2">
        <li>
          Community goodwill and public recognition as an inclusive business
        </li>
        <li>
          Marketing reach — featured in our event calendar, email newsletter,
          and social media
        </li>
        <li>Increased foot traffic and sales during Pride Week events</li>
      </ul>

      <h2 className="mt-10">Ways to Participate</h2>
      <ul className="mt-4 space-y-2">
        <li>
          <strong>Window displays</strong> — Show pride symbols and rainbow
          flags in your storefront
        </li>
        <li>
          <strong>Themed events</strong> — Host a Pride-themed special during
          Pride Week
        </li>
        <li>
          <strong>Event hosting</strong> — Host an official Pride Week event and
          get listed on our calendar
        </li>
      </ul>

      <h2 className="mt-10">Sponsorship Tiers</h2>
      <div className="mt-4 space-y-6">
        <div>
          <h3>Friend — $250+</h3>
          <p>
            Logo on our website and recognition across our social media
            channels.
          </p>
        </div>
        <div>
          <h3>Champion — $5,000+</h3>
          <p>
            Everything in Friend, plus a physical banner at Pride Week events
            and verbal announcements at programming.
          </p>
        </div>
        <div>
          <h3>Unicorn — $20,000+</h3>
          <p>
            Everything in Champion, plus a festival booth and speaking
            opportunities at Pride Week events.
          </p>
        </div>
      </div>

      <h2 className="mt-10">Support We Provide</h2>
      <ul className="mt-4 space-y-2">
        <li>Marketing materials and co-branded assets</li>
        <li>Event planning assistance</li>
        <li>Connections to local LGBTQ+ artists and community groups</li>
      </ul>

      <h2 className="mt-10">Get in Touch</h2>
      <p className="mt-4">
        Interested in partnering with us?{' '}
        <a href="mailto:hello@truckeepride.org">Email hello@truckeepride.org</a>{' '}
        and we&apos;ll get back to you.
      </p>
    </main>
  )
}
