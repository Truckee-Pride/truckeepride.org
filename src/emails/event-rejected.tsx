import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
  Hr,
  Preview,
  Heading,
} from '@react-email/components'

type Props = {
  eventTitle: string
  editUrl: string
  rejectionReason: string
  ownerName: string | null
}

export function EventRejectedEmail({
  eventTitle,
  editUrl,
  rejectionReason,
  ownerName,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your event &quot;{eventTitle}&quot; needs some changes</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>Your event needs some changes</Heading>
          <Text style={textStyle}>Hi {ownerName ?? 'there'},</Text>
          <Text style={textStyle}>
            Thanks for submitting an event to Truckee Pride. We reviewed your
            submission and have a few notes:
          </Text>
          <div style={reasonBlockStyle}>
            <Text style={reasonTextStyle}>{rejectionReason}</Text>
          </div>
          <Text style={textStyle}>
            You&apos;re welcome to update your event and resubmit for review.
          </Text>
          <Button href={editUrl} style={buttonStyle}>
            Edit Your Event
          </Button>
          <Text style={textStyle}>
            Questions? Reply to this email or reach us at{' '}
            <a href="mailto:hello@truckeepride.org" style={linkStyle}>
              hello@truckeepride.org
            </a>
            .
          </Text>
          <Hr style={hrStyle} />
          <Text style={footerStyle}>
            Truckee Tahoe Pride Foundation · 501(c)3 nonprofit · Truckee, CA
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const bodyStyle = {
  backgroundColor: '#ffffff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '40px 24px',
}

const headingStyle = {
  color: '#171717',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 16px',
}

const textStyle = {
  color: '#171717',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const reasonBlockStyle = {
  backgroundColor: '#f9fafb',
  padding: '16px',
  borderRadius: '8px',
  borderLeft: '4px solid #e5e7eb',
  margin: '0 0 24px',
}

const reasonTextStyle = {
  color: '#171717',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
}

const buttonStyle = {
  backgroundColor: '#b800bf',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-block',
  marginBottom: '24px',
}

const linkStyle = {
  color: '#b800bf',
}

const hrStyle = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const footerStyle = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
}
