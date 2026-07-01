import { EDR_BRAND } from '@/lib/customers/everyday-rewards/config';
import { Container, Eyebrow, DisplayHeading } from '@/components/customers/everyday-rewards/ui';
import { EconomicsModel } from './EconomicsModel';

export default function EconomicsPage() {
  return (
    <Container style={{ padding: '48px 24px 0' }}>
      <Eyebrow>The model, live</Eyebrow>
      <DisplayHeading size={38}>Move the inputs, watch the revenue move</DisplayHeading>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.6,
          color: EDR_BRAND.charcoal,
          maxWidth: 660,
          margin: '16px 0 36px',
        }}
      >
        Points earned per wait moment, times the shopper base, times the fill
        rate, split three ways — shopper, Everyday Rewards, assembl. Every input
        below is an editable assumption. This is a conversation starter, not a
        committed forecast.
      </p>
      <EconomicsModel />
    </Container>
  );
}
