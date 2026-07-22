'use client';

import type { ResolvedRecipient } from '@/lib/concepts/recipients';
import { Eyebrow, OrangeButton } from '@/components/customers/everyday-rewards/ui';

const NAVY = '#22303c';
const CHARCOAL = '#3a474e';
const GREY = '#8a959c';

/**
 * The private editorial arrival. Personalised from `?for=` when the recipient
 * is known; a neutral greeting otherwise. Frames the work as considered product
 * strategy, not an unsolicited redesign, and carries the independent-concept
 * disclosure.
 */
export function PrivateInvitation({
  recipient,
  onExperience,
}: {
  recipient: ResolvedRecipient;
  onExperience: () => void;
}) {
  const greeting = recipient.personalised ? `${recipient.firstName} —` : 'A concept prepared for you —';

  return (
    <div style={{ maxWidth: 720 }}>
      <Eyebrow>Everyday Rewards × assembl · private concept</Eyebrow>
      <h1
        style={{
          fontFamily: 'var(--edr-display), Georgia, serif',
          fontWeight: 500,
          fontSize: 44,
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
          color: NAVY,
          margin: '6px 0 0',
        }}
      >
        {greeting}
      </h1>
      <p style={{ fontSize: 19, lineHeight: 1.5, color: CHARCOAL, margin: '16px 0 0', fontFamily: 'var(--edr-display), Georgia, serif' }}>
        We assembled what the next version of your customer experience could look like.
      </p>
      <p style={{ fontSize: 15.5, lineHeight: 1.65, color: CHARCOAL, margin: '20px 0 0' }}>
        This private concept explores how Everyday Rewards could move from rewarding a
        transaction to understanding and preparing the household journey around it — built on
        your own public product, with the customer approving every step. One customer friction,
        one prepared journey, one commercial hypothesis you could test.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0 0', flexWrap: 'wrap' }}>
        <OrangeButton onClick={onExperience}>Experience the journey ↓</OrangeButton>
        <span style={{ fontSize: 12.5, color: GREY }}>
          Independent assembl concept · not commissioned by or affiliated with {recipient.org}.
        </span>
      </div>
    </div>
  );
}
