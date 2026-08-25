'use client';

/**
 * The reply, not "book a demo". Three concrete ways to respond, each opening a
 * pre-filled email to Kate at assembl — no form, no scheduler. Adapted from the
 * reviewed concept page; strings live in the concept copy manifest.
 */

import type { ResolvedRecipient } from '@/lib/concepts/recipients';
import { REPLY_VERBS_COPY as C } from '@/lib/concepts/everyday-rewards-copy';
import { Eyebrow, DisplayHeading } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';

const NAVY = '#22303c';
const CHARCOAL = '#3a474e';
const GREY = '#8a959c';
const ORANGE = '#fd6400';

function mailto(subject: string, recipient: ResolvedRecipient): string {
  const who = recipient.personalised ? ` (from ${recipient.fullName}, ${recipient.org})` : '';
  const body = `Kia ora Kate,${who ? `\n\n${who.trim()}` : ''}\n\n`;
  return `mailto:${C.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function ReplyVerbs({ recipient }: { recipient: ResolvedRecipient }) {
  return (
    <div>
      <Eyebrow>{C.sectionLabel}</Eyebrow>
      <DisplayHeading size={32}>{C.heading}</DisplayHeading>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: CHARCOAL, maxWidth: 620, margin: '12px 0 26px' }}>
        {C.body}
      </p>

      <div style={{ display: 'grid', gap: 12, maxWidth: 760 }}>
        {C.verbs.map((v) => (
          <a
            key={v.key}
            href={mailto(v.subject, recipient)}
            className={styles.assemble}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              padding: '18px 20px',
              borderRadius: 14,
              border: '1px solid rgba(34,48,60,0.14)',
              background: '#fff',
              textDecoration: 'none',
              color: NAVY,
            }}
          >
            <span style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: ORANGE, minWidth: 62 }}>
              {v.label}
            </span>
            <span style={{ fontFamily: 'var(--edr-display), Georgia, serif', fontSize: 19, lineHeight: 1.35, flex: 1 }}>
              {v.line}
            </span>
            <span aria-hidden style={{ color: ORANGE, fontSize: 18 }}>→</span>
          </a>
        ))}
      </div>
      <p style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 12, letterSpacing: '0.06em', color: GREY, marginTop: 20 }}>
        {C.footer}
      </p>
    </div>
  );
}
