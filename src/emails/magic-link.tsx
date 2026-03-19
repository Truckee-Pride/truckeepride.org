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
  url: string
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
            Click the button below to sign in. This link expires in 24 hours and
            can only be used once.
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

const mutedStyle = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}
