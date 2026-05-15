import * as React from 'https://esm.sh/react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.22?deps=react@18.3.1,react-dom@18.3.1'

interface IndustryPackWelcomeEmailProps {
  companyName: string
  contactName: string
  inboxUrl: string
  aliasEmail: string
  keteName: string
}

export const IndustryPackWelcomeEmail = ({
  companyName,
  contactName,
  inboxUrl,
  aliasEmail,
  keteName,
}: IndustryPackWelcomeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Assembl {keteName} fleet is being provisioned</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your fleet is coming online</Heading>
        <Text style={text}>Kia ora {contactName || companyName},</Text>
        <Text style={text}>
          {companyName} is now on the Assembl Industry Pack. We have provisioned
          your tenant, activated your {keteName} fleet, and opened your operator
          inbox.
        </Text>
        <Text style={text}>
          Forward operational mail to <strong>{aliasEmail}</strong>. Your first
          welcome briefing draft should appear in the inbox shortly.
        </Text>
        <Button style={button} href={inboxUrl}>
          Open your inbox
        </Button>
        <Text style={footer}>
          Assembl — governed intelligence for Aotearoa operators.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default IndustryPackWelcomeEmail

const main = { backgroundColor: '#FAF7F2', fontFamily: 'Arial, sans-serif' }
const container = { padding: '28px 25px', maxWidth: '620px' }
const h1 = {
  fontSize: '28px',
  fontWeight: 'normal' as const,
  color: '#23211F',
  margin: '0 0 22px',
}
const text = {
  fontSize: '15px',
  color: '#23211F',
  lineHeight: '1.6',
  margin: '0 0 18px',
}
const button = {
  backgroundColor: '#2B6B57',
  color: '#FAF7F2',
  fontSize: '14px',
  borderRadius: '999px',
  padding: '12px 22px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#6F6158', margin: '28px 0 0' }
