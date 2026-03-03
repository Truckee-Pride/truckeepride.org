import Link from 'next/link'

export function Footer() {
  return (
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
        <small>
          Truckee Tahoe Pride Foundation is a registered 501(c)3 non-profit. EIN
          994735689
        </small>
      </p>
      <p>
        <small>
          Looking for the Wolverines? Visit{' '}
          <a href="https://truckeepride.com">TruckeePride.com</a>
        </small>
      </p>
    </footer>
  )
}
