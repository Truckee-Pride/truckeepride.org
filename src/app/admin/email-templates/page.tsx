import { render } from '@react-email/components'
import { MagicLinkEmail } from '@/emails/magic-link'
import { EventApprovedEmail } from '@/emails/event-approved'
import { EventRejectedEmail } from '@/emails/event-rejected'
import { PageHeader } from '@/components/PageHeader'

const PLACEHOLDER = {
  ownerName: 'Alex Johnson',
  eventTitle: 'Rainbow Picnic in the Park',
  eventUrl: 'https://truckeepride.org/events/rainbow-picnic-in-the-park',
  editUrl: 'https://truckeepride.org/events/abc123/edit',
  magicLinkUrl: 'https://truckeepride.org/api/auth/callback/email?token=abc123',
  rejectionReason: '{REASON EVENT WAS REJECTED}',
}

export default async function EmailTemplatesPage() {
  const [magicLinkHtml, approvedHtml, rejectedHtml] = await Promise.all([
    render(<MagicLinkEmail url={PLACEHOLDER.magicLinkUrl} />),
    render(
      <EventApprovedEmail
        ownerName={PLACEHOLDER.ownerName}
        eventTitle={PLACEHOLDER.eventTitle}
        eventUrl={PLACEHOLDER.eventUrl}
      />,
    ),
    render(
      <EventRejectedEmail
        ownerName={PLACEHOLDER.ownerName}
        eventTitle={PLACEHOLDER.eventTitle}
        editUrl={PLACEHOLDER.editUrl}
        rejectionReason={PLACEHOLDER.rejectionReason}
      />,
    ),
  ])

  return (
    <>
      <PageHeader
        title="Email Templates"
        subtitle="Preview of all transactional emails sent to users."
      />
      <div className="mt-8 flex flex-col gap-12">
        <EmailPreview title="Magic Link (Sign In)" html={magicLinkHtml} />
        <EmailPreview title="Event Approved" html={approvedHtml} />
        <EmailPreview title="Event Rejected" html={rejectedHtml} />
      </div>
    </>
  )
}

function EmailPreview({ title, html }: { title: string; html: string }) {
  return (
    <section>
      <h2 className="mb-4">{title}</h2>
      <iframe
        srcDoc={html}
        title={title}
        className="border-border w-full rounded-lg border"
        style={{ height: '480px' }}
      />
    </section>
  )
}
