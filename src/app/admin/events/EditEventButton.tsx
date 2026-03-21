import { TextLink } from '@/components/TextLink'

export function EditEventButton({ slug }: { slug: string }) {
  return <TextLink href={`/events/${slug}/edit`}>Edit</TextLink>
}
