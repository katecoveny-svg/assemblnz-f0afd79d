
import * as React from 'https://esm.sh/react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.22?deps=react@18.3.1,react-dom@18.3.1'

interface MagicLinkEmailProps {
  // Kept for compatibility with the auth-email-hook props; the visible brand is
  // always the lowercase `assembl` wordmark per locked canon (2026-06-23).
  siteName?: string
  confirmationUrl: string
}

/**
 * Magic-link email — locked canon (2026-06-23).
 *
 * Charcoal/canary/cream palette, no forest green, no sage. Email clients don't
 * load web fonts reliably, so Cormorant falls back to Georgia (serif) for the
 * wordmark + H1, Lato to a Helvetica/Arial stack for body, Space Mono to a
 * monospace stack for the footer. All styles inline.
 */
export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your sign-in link for assembl. It expires in one hour.</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* header: lowercase assembl wordmark + canary pill-dash */}
        <Section style={header}>
          <span style={wordmark}>assembl</span>
          <span style={pillDash}>&nbsp;</span>
        </Section>

        <Heading style={h1}>Sign in to assembl</Heading>

        <Text style={text}>
          Click the button to finish signing in. Link expires in one hour.
        </Text>

        <Section style={{ textAlign: 'center' as const, margin: '0 0 28px' }}>
          <Button style={button} href={confirmationUrl}>
            Sign in
          </Button>
        </Section>

        <Text style={fallback}>
          Or paste this link into your browser:
          <br />
          <Link href={confirmationUrl} style={fallbackLink}>
            {confirmationUrl}
          </Link>
        </Text>

        <Text style={footer}>
          If you didn&apos;t request this, ignore this email. Made in Aotearoa.
          Privacy Act 2020 compliant.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

// ── canon palette ───────────────────────────────────────────────────────────
const CANARY = '#FFD42A'
const CHARCOAL = '#3A3832'
const BODY = '#56544B'
const CREAM = '#FFF7EC'
const PAPER = '#FFFFFF'
const HAIRLINE = '#EFEADC'
const MUTED = '#8A8678'

const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif"
const SANS = "Lato, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
const MONO = "'Space Mono', ui-monospace, 'Courier New', monospace"

const main = {
  backgroundColor: CREAM,
  fontFamily: SANS,
  margin: '0',
  padding: '32px 0',
}
const container = {
  backgroundColor: PAPER,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: '20px',
  maxWidth: '480px',
  margin: '0 auto',
  padding: '36px 36px 32px',
}
const header = {
  display: 'block',
  margin: '0 0 28px',
}
const wordmark = {
  fontFamily: SERIF,
  fontWeight: 600,
  fontSize: '28px',
  letterSpacing: '-0.01em',
  color: CHARCOAL,
  verticalAlign: 'middle' as const,
}
const pillDash = {
  display: 'inline-block',
  width: '22px',
  height: '7px',
  lineHeight: '7px',
  fontSize: '0',
  borderRadius: '4px',
  backgroundColor: CANARY,
  verticalAlign: 'middle' as const,
  marginLeft: '7px',
}
const h1 = {
  fontFamily: SERIF,
  fontSize: '30px',
  fontWeight: 500,
  color: CHARCOAL,
  lineHeight: '1.1',
  margin: '0 0 16px',
}
const text = {
  fontFamily: SANS,
  fontSize: '16px',
  fontWeight: 400,
  color: CHARCOAL,
  lineHeight: '1.5',
  margin: '0 0 28px',
}
const button = {
  backgroundColor: CANARY,
  color: CHARCOAL,
  fontFamily: SANS,
  fontSize: '16px',
  fontWeight: 700,
  borderRadius: '99px',
  padding: '15px 36px',
  textDecoration: 'none',
  display: 'inline-block',
}
const fallback = {
  fontFamily: SANS,
  fontSize: '13px',
  color: BODY,
  lineHeight: '1.5',
  margin: '0 0 28px',
}
const fallbackLink = {
  color: '#C79B1F',
  wordBreak: 'break-all' as const,
}
const footer = {
  fontFamily: MONO,
  fontSize: '11px',
  color: MUTED,
  lineHeight: '1.6',
  letterSpacing: '0.02em',
  borderTop: `1px solid ${HAIRLINE}`,
  paddingTop: '20px',
  margin: '0',
}
