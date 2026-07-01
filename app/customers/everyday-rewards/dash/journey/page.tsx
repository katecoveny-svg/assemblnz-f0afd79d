import { EDR_BRAND } from '@/lib/customers/everyday-rewards/config';
import { Container, Eyebrow, DisplayHeading } from '@/components/customers/everyday-rewards/ui';
import { JourneyPlayer } from './JourneyPlayer';

export default function JourneyPage() {
  return (
    <Container style={{ padding: '48px 24px 0' }}>
      <Eyebrow>The full shopping journey</Eyebrow>
      <DisplayHeading size={38}>
        From browsing to a $15 voucher — same rail, fewer waits wasted
      </DisplayHeading>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.6,
          color: EDR_BRAND.charcoal,
          maxWidth: 660,
          margin: '16px 0 36px',
        }}
      >
        Walk one shopper through a real journey: browse, the checkout scan, points
        earned across the day, crossing the native 2,000-point threshold, and
        redeeming for a voucher or a travel reward. Wait moments simply get them
        there faster — nothing about the redemption changes.
      </p>
      <JourneyPlayer />
    </Container>
  );
}
