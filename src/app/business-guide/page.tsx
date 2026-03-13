import type { Metadata } from 'next'
import { Button } from '@/components/Button'
import { LayoutWidth } from '@/lib/constants'
import { PageHeader } from '@/components/PageHeader'
import { DONATE_BUTTON_TEXT } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Local Business Guide',
  description:
    'Partner with Truckee Pride to show your support for the LGBTQ+ community. Sponsorship tiers, participation options, and marketing benefits.',
}

export default function BusinessGuidePage() {
  return (
    <main className={LayoutWidth.prose}>
      <section>
        <div className="flex justify-center">
          <Button href="/donate">{DONATE_BUTTON_TEXT}</Button>
        </div>
      </section>
      <PageHeader
        title="Local Business Guide"
        subtitle="Thank you to all of the local Truckee businesses who have helped make Truckee Pride possible!"
      />

      <p>
        Learn more about the business benefits of getting involved in
        Truckee&apos;s Pride week:
      </p>
      <ul>
        <li>
          <strong>Supporting Our Community:</strong> Businesses who participate
          in Truckee Pride can show their support for diversity and inclusion in
          our community.
        </li>
        <li>
          <strong>Marketing and Events Calendar:</strong> Businesses that
          participate in Truckee Pride are featured in our marketing materials
          and events calendar, reaching a wider audience of locals and visitors.
        </li>
        <li>
          <strong>Increased Sales:</strong> Businesses get increased foot
          traffic and sales from both locals and visitors celebrating Truckee
          Pride week.
        </li>
      </ul>

      <h2>Levels of Support</h2>

      <p>Here are some ways that local businesses can participate:</p>
      <ul>
        <li>
          <strong>Window Display:</strong> A pride flag, poster or other symbol
          of support in their window
        </li>
        <li>
          <strong>Selling Pride-Themed Items:</strong> Sell Pride-themed
          merchandise, such as books, t-shirts, or food and drinks
        </li>
        <li>
          <strong>Hosting An Event:</strong> Host a Pride-themed event, such as
          a group ride, live music, trivia or reading group. To be added to the
          official events calendar,{' '}
          <a href="mailto:hello@truckeepride.org">get in touch</a>.
        </li>
        <li>
          <strong>Support:</strong> Sponsor Truckee Pride Week or give in-kind
          contributions. Truckee Pride Week is proudly run by local volunteers.
          All sponsorship goes directly to Pride events, music, food and
          decorations.
        </li>
      </ul>

      <h3>Sponsorship Levels</h3>

      <p>
        Truckee Tahoe Pride Foundation is a registered 501c3 non profit. We try
        to use our spending to support the local community as much as possible:
        we use local printers, hire local artists and support local businesses.
      </p>
      <ul>
        <li>
          <strong>Friend — $250+</strong> Logo on our website and social media
          shout-outs
        </li>
        <li>
          <strong>Champion — $5,000+</strong> The above plus physical banner and
          shout-outs at major events
        </li>
        <li>
          <strong>Unicorn — $20,000+</strong> The above plus booth at our
          festival and speaking opportunities (and knowing you helped make some
          really awesome events possible!)
        </li>
      </ul>

      <h2>How can we help?</h2>

      <p>
        We&apos;re here to assist you in any way we can. We can provide you with
        marketing materials, help you plan and promote your events, connect you
        with artists and other organizations in the community.
      </p>

      <p>
        For questions or requests, please{' '}
        <a href="mailto:hello@truckeepride.org">send us an email</a>.
      </p>

      <p>
        <strong>
          We hope you&apos;ll consider participating in Truckee Pride 2025. Lets
          have fun and make Truckee a more welcoming and inclusive place!
        </strong>
      </p>

      <div className="mt-8">
        <Button href="/donate">{DONATE_BUTTON_TEXT}</Button>
      </div>
    </main>
  )
}
