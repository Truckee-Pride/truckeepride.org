import { render } from '@react-email/components'
import { Resend } from 'resend'
import type { CreateEmailOptions } from 'resend'
import { EventApprovedEmail } from '@/emails/event-approved'
import { EventRejectedEmail } from '@/emails/event-rejected'

const resend = new Resend(process.env.RESEND_API_KEY)

export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

/**
 * Send an email via Resend. Non-critical emails (default) log errors and
 * continue silently. Critical emails (e.g. magic link) re-throw so the
 * caller can surface the failure.
 */
export async function sendEmail({
  critical = false,
  ...params
}: { critical?: boolean } & CreateEmailOptions) {
  try {
    await resend.emails.send(params)
  } catch (err) {
    console.error('Email send failed:', err)
    if (critical) throw err
  }
}

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
  await sendEmail({
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
  await sendEmail({
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
