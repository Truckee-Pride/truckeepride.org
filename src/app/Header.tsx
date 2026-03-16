import Image from 'next/image'
import Link from 'next/link'
import { LayoutWidth } from '@/lib/constants'
import { getCurrentUser } from '@/lib/auth-stub'
import { signOut } from '@/lib/auth'
import { TextLink } from '@/components/TextLink'
import { TextButton } from '@/components/TextButton'

export async function Header() {
  const user = await getCurrentUser()

  return (
    <header className={`relative mt-0 banner:mt-8 ${LayoutWidth.banner}`}>
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
      <p className="mt-2 pr-4 text-right text-xs text-gray-500 banner:absolute banner:bottom-2 banner:right-2 banner:mt-0 banner:rounded banner:bg-white/70 banner:px-2 banner:py-0.5">
        Art by maddie{' '}
        <a
          href="https://www.instagram.com/mtscapes.art?igsh=NTc4MTIwNjQ2YQ=="
          target="_blank"
          rel="noopener noreferrer"
        >
          @mtscapes.art
        </a>
      </p>
      {user && (
        <nav className="mt-2 flex items-center justify-end gap-4 px-2">
          {user.role === 'admin' && (
            <TextLink href="/admin/events">Admin</TextLink>
          )}
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/' })
            }}
          >
            <TextButton type="submit">Sign out</TextButton>
          </form>
        </nav>
      )}
    </header>
  )
}
