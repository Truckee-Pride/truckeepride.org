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
            changes, you can edit the event from the event page.
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

const eventTitleStyle = {
  color: '#171717',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 24px',
}
