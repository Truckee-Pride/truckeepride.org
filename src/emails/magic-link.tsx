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
  url: string
  email: string
}

export function MagicLinkEmail({ url }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Sign in to Truckee Pride</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>Sign in to Truckee Pride</Heading>
          <Text style={textStyle}>
            Click the button below to sign in. This link expires in 24 hours
            and can only be used once.
          </Text>
          <Button href={url} style={buttonStyle}>
            Sign In
          </Button>
          <Text style={mutedStyle}>
            If you didn&apos;t request this email, you can safely ignore it.
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
}

const mutedStyle = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0',
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
