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
  Row,
  Column,
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
import type { Event } from '@/db/schema/events'

type Props = {
  event: Event
  submitterName: string | null
  submitterEmail: string
  reviewUrl: string
}

function formatDateRange(start: Date, end: Date | null) {
  const tz = 'America/Los_Angeles'
  const dateStr = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(start)

  const startTime = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
  }).format(start)

  if (!end) return `${dateStr} · ${startTime}`

  const endTime = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
  }).format(end)

  return `${dateStr} · ${startTime} – ${endTime}`
}

export function EventSubmittedEmail({
  event,
  submitterName,
  submitterEmail,
  reviewUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>
        New event submitted: {event.emoji} {event.title}
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>New event submitted for review</Heading>

          <Text style={textStyle}>
            {submitterName ?? 'A user'} ({submitterEmail}) just submitted an
            event for review.
          </Text>

          {/* Event title */}
          <Text style={eventTitleStyle}>
            {event.emoji} {event.title}
          </Text>

          {/* Short description */}
          <Text style={shortDescStyle}>{event.shortDescription}</Text>

          {/* Event details table */}
          <Section style={detailsSectionStyle}>
            <Row style={detailRowStyle}>
              <Column style={labelStyle}>When</Column>
              <Column style={valueStyle}>
                {formatDateRange(event.startTime, event.endTime ?? null)}
              </Column>
            </Row>
            <Row style={detailRowStyle}>
              <Column style={labelStyle}>Where</Column>
              <Column style={valueStyle}>
                {event.locationName}
                {event.locationAddress ? ` · ${event.locationAddress}` : ''}
              </Column>
            </Row>
            <Row style={detailRowStyle}>
              <Column style={labelStyle}>Ages</Column>
              <Column style={valueStyle}>{event.ageRestriction}</Column>
            </Row>
            {event.requiresTicket && (
              <Row style={detailRowStyle}>
                <Column style={labelStyle}>Tickets</Column>
                <Column style={valueStyle}>
                  {event.ticketUrl ? event.ticketUrl : 'Required'}
                </Column>
              </Row>
            )}
            {event.dogsWelcome && (
              <Row style={detailRowStyle}>
                <Column style={labelStyle}>Dogs</Column>
                <Column style={valueStyle}>Welcome 🐕</Column>
              </Row>
            )}
            {event.vibeTags.length > 0 && (
              <Row style={detailRowStyle}>
                <Column style={labelStyle}>Vibes</Column>
                <Column style={valueStyle}>{event.vibeTags.join(', ')}</Column>
              </Row>
            )}
          </Section>

          <Button href={reviewUrl} style={reviewButtonStyle}>
            View Event
          </Button>

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
  fontSize: '22px',
  fontWeight: '700' as const,
  margin: '0 0 8px',
}

const shortDescStyle = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
  fontStyle: 'italic' as const,
}

const detailsSectionStyle = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const detailRowStyle = {
  marginBottom: '8px',
}

const labelStyle = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600' as const,
  width: '80px',
  verticalAlign: 'top' as const,
  paddingBottom: '8px',
}

const valueStyle = {
  color: '#171717',
  fontSize: '14px',
  lineHeight: '20px',
  verticalAlign: 'top' as const,
  paddingBottom: '8px',
}

const reviewButtonStyle = {
  ...buttonStyle,
  textAlign: 'center' as const,
  width: '100%',
  boxSizing: 'border-box' as const,
}
