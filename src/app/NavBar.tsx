import { cn } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth-stub'
import { signOut } from '@/lib/auth'
import { TextLink } from '@/components/TextLink'
import { TextButton } from '@/components/TextButton'
import { Form } from '@/components/forms/Form'

const navBar = cn(
  'fixed top-0 left-0 right-0 z-50',
  'flex h-10 items-center justify-end gap-4',
  'bg-brand px-4',
)

export async function NavBar() {
  const user = await getCurrentUser()
  if (!user) return null

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: '/' })
  }

  return (
    <nav className={navBar}>
      {user?.role === 'admin' && (
        <TextLink
          href="/admin/events"
          className="text-inverse hover:text-inverse"
        >
          Admin
        </TextLink>
      )}
      {user && (
        <Form action={handleSignOut} className="mt-0">
          <TextButton type="submit" className="text-inverse hover:text-inverse">
            Sign out
          </TextButton>
        </Form>
      )}
    </nav>
  )
}
