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
  Section,
  Link,
} from '@react-email/components'
import {
  bodyStyle,
  containerStyle,
  headingStyle,
  textStyle,
  buttonStyle,
  hrStyle,
  footerStyle,
} from './styles'

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
          <Section style={reasonBlockStyle}>
            <Text style={reasonTextStyle}>{rejectionReason}</Text>
          </Section>
          <Text style={textStyle}>
            You&apos;re welcome to update your event and resubmit for review.
          </Text>
          <Button href={editUrl} style={buttonStyle}>
            Edit Your Event
          </Button>
          <Text style={textStyle}>
            Questions? Reply to this email or reach us at{' '}
            <Link href="mailto:hello@truckeepride.org" style={linkStyle}>
              hello@truckeepride.org
            </Link>
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

const linkStyle = {
  color: '#b800bf',
}
