import type { Metadata } from 'next'
import Image from 'next/image'
import { LayoutWidth } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Donate',
  description:
    'Donate to Truckee Tahoe Pride Foundation, a 501(c)3 non-profit. Venmo, PayPal, credit card, wire transfer, or check.',
}

export default function DonatePage() {
  return (
    <main className={LayoutWidth.prose}>
      <h1>Donate to Truckee Pride</h1>
      <p>
        Truckee Tahoe Pride Foundation is a 501(c)3 organization. We accept
        donations via Venmo, PayPal, credit card and wire transfer, and all of
        the funds go towards providing local events to the whole community.
      </p>

      <section>
        <h2>Venmo</h2>
        <p>
          <a href="https://venmo.com/code?user_id=4295538786698462135">
            @truckeepride
          </a>
        </p>
        <a href="https://venmo.com/code?user_id=4295538786698462135">
          <Image
            src="https://cdn.prod.website-files.com/65ce742373106d87447625dd/67e19ebe905a6a4925e001aa_Screenshot%202025-03-24%20at%2011.04.25%E2%80%AFAM.png"
            alt="Venmo QR code for @truckeepride"
            width={200}
            height={200}
          />
        </a>
      </section>

      <section>
        <h2>PayPal</h2>
        <p>
          <a href="https://www.paypal.com/donate/?hosted_button_id=9DB9NJ4WHRC46">
            donate@truckeepride.org
          </a>
        </p>
        <a href="https://www.paypal.com/donate/?hosted_button_id=9DB9NJ4WHRC46">
          <Image
            src="https://cdn.prod.website-files.com/65ce742373106d87447625dd/67e19bf8f8065f5c1c7234f0_AD_4nXdqTgQfeadrW_o5tT4Wl0t6e4Zn6fPBVs_3SqjKEQWUOFb1zrJvOqTKNv54sODpC_-Ib2Q05f-LRxpoDsLP833FPJiXfQpR-LFZ_hLhLXJlO1XTJkp6kySt9cmTYsMGd_lxS6GhsQ.png"
            alt="PayPal donate button"
            width={200}
            height={80}
          />
        </a>
      </section>

      <section>
        <h2>Credit Card</h2>
        <p>
          <a href="https://www.paypal.com/donate/?hosted_button_id=9DB9NJ4WHRC46">
            Checkout here with a credit or debit card
          </a>
        </p>
      </section>

      <section>
        <h2>Wire Transfer</h2>
        <p>
          Truckee Tahoe Pride Foundation is a registered 501(c)3 non-profit, set
          up in many giving platforms. You can search by our EIN:{' '}
          <strong>994735689</strong>
        </p>
      </section>

      <section>
        <h2>Check</h2>
        <p>
          Make checks out to &ldquo;Truckee Tahoe Pride Foundation&rdquo; and
          mail to:
        </p>
        <address>
          Truckee Pride
          <br />
          10641 Ponderosa Drive
          <br />
          Truckee, CA 96161
        </address>
      </section>

      <p>
        If you need more help donating, email{' '}
        <a href="mailto:hi@truckeepride.org">hi@truckeepride.org</a> &mdash; we
        can provide invoices, receipts, and W-2s as required.
      </p>

      <section>
        <h2>About Truckee Pride</h2>
        <p>
          We&apos;re a grass-roots volunteer-run 501(c)3 non-profit working to
          make everyone feel welcomed and at home in the mountains.
        </p>
        <p>
          We use our fundraising to provide local events free of charge to the
          whole community. We try to spend locally as much as possible for
          printing, materials, groceries and professional services, and we
          support local artists where possible.
        </p>
      </section>
    </main>
  )
}
