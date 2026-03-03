import type { Metadata } from 'next'
import { Header } from './Header'
import { Footer } from './Footer'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Truckee Pride',
    template: '%s | Truckee Pride',
  },
  description:
    'A grass-roots volunteer-run 501(c)3 nonprofit working to make everyone feel welcomed and at home in the mountains. Truckee, CA.',
  metadataBase: new URL('https://truckeepride.org'),
  openGraph: {
    title: 'Truckee Pride',
    description:
      'A grass-roots volunteer-run 501(c)3 nonprofit working to make everyone feel welcomed and at home in the mountains.',
    url: 'https://truckeepride.org',
    siteName: 'Truckee Pride',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
