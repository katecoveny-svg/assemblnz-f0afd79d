import { EDR_BRAND } from '@/lib/customers/everyday-rewards/config';
import { Container, Eyebrow, DisplayHeading } from '@/components/customers/everyday-rewards/ui';
import { WaitStatesDemo } from './WaitStatesDemo';

export default function WaitStatesPage() {
  return (
    <Container style={{ padding: '48px 24px 0' }}>
      <Eyebrow>Six real waits · one interaction</Eyebrow>
      <DisplayHeading size={38}>
        Every spinner is a place to earn
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
        These are the actual wait moments already in the Everyday Rewards app.
        Tap any one to watch the interaction: the real spinner, a sponsored earn
        moment that slides in, the running points tally, and — once you’ve seen
        them all — the Mana Receipt that itemises the lot.
      </p>
      <WaitStatesDemo />
    </Container>
  );
}
