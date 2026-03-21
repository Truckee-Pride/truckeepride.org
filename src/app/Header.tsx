import Image from 'next/image'
import Link from 'next/link'
import { LayoutWidth } from '@/lib/constants'

export function Header() {
  return (
    <header className={`banner:mt-8 relative mt-0 ${LayoutWidth.banner}`}>
      <Link href="/">
        <Image
          src="https://cdn.prod.website-files.com/65ce742373106d87447625dd/69838883c1472e6c00d4d154_16dc3cdd8d4656fe121d019f20cc67ff_Pride%20Banner.png"
          alt="Truckee Pride Week 2026 — May 30th - June 7th"
          width={1077}
          height={0}
          sizes="100vw"
          style={{ width: '100%', height: 'auto' }}
          priority
        />
      </Link>
      <p className="banner:absolute banner:bottom-2 banner:right-2 banner:mt-0 banner:rounded banner:bg-white/70 banner:px-2 banner:py-0.5 mt-2 pr-4 text-right text-xs text-gray-500">
        Art by maddie{' '}
        <a
          href="https://www.instagram.com/mtscapes.art?igsh=NTc4MTIwNjQ2YQ=="
          target="_blank"
          rel="noopener noreferrer"
        >
          @mtscapes.art
        </a>
      </p>
    </header>
  )
}
