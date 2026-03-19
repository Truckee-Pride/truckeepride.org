import { render } from '@react-email/components'
import { Resend } from 'resend'
import { EventApprovedEmail } from '@/emails/event-approved'
import { EventRejectedEmail } from '@/emails/event-rejected'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

export async function sendEventApprovedEmail({
  to,
  ownerName,
  eventTitle,
  eventUrl,
}: {
  to: string
  ownerName: string | null
  eventTitle: string
  eventUrl: string
}) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Your event "${eventTitle}" has been approved`,
    html: await render(
      <EventApprovedEmail
        ownerName={ownerName}
        eventTitle={eventTitle}
        eventUrl={eventUrl}
      />,
    ),
  })
}

export async function sendEventRejectedEmail({
  to,
  ownerName,
  eventTitle,
  editUrl,
  rejectionReason,
}: {
  to: string
  ownerName: string | null
  eventTitle: string
  editUrl: string
  rejectionReason: string
}) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Your event "${eventTitle}" needs some changes`,
    html: await render(
      <EventRejectedEmail
        ownerName={ownerName}
        eventTitle={eventTitle}
        editUrl={editUrl}
        rejectionReason={rejectionReason}
      />,
    ),
  })
}
