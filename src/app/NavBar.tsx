import { getCurrentUser } from '@/lib/auth-stub'
import { signOut } from '@/lib/auth'
import { TextLink } from '@/components/TextLink'
import { TextButton } from '@/components/TextButton'

export async function NavBar() {
  const user = await getCurrentUser()
  if (!user) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-10 items-center justify-end gap-4 bg-brand px-4">
      {user?.role === 'admin' && (
        <TextLink
          href="/admin/events"
          className="text-inverse hover:text-inverse"
        >
          Admin
        </TextLink>
      )}
      {user && (
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/' })
          }}
        >
          <TextButton type="submit" className="text-inverse hover:text-inverse">
            Sign out
          </TextButton>
        </form>
      )}
    </nav>
  )
}
