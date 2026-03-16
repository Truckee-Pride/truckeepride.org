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
  eventUrl: string
  ownerName: string | null
}

export function EventApprovedEmail({ eventTitle, eventUrl, ownerName }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your event &quot;{eventTitle}&quot; has been approved</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>Your event has been approved!</Heading>
          <Text style={textStyle}>Hi {ownerName ?? 'there'},</Text>
          <Text style={textStyle}>
            Great news! Your event has been approved and is now live on the
            Truckee Pride calendar.
          </Text>
          <Text style={eventTitleStyle}>{eventTitle}</Text>
          <Button href={eventUrl} style={buttonStyle}>
            View Your Event
          </Button>
          <Text style={textStyle}>
            Thank you for contributing to our community! If you need to make any
            changes, you can edit the event from the page.
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

const eventTitleStyle = {
  color: '#171717',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 24px',
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
