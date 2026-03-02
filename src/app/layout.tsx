import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Truckee Pride',
  description: 'Serving the LGBTQ+ community in Truckee, CA',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
