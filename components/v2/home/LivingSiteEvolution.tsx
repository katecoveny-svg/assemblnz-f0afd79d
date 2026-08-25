'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { palette } from '@assembl/canvas/tokens';
import { MicroLabel } from '@assembl/canvas';
import styles from './home.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The Living Site evolution — a business assembling itself on scroll.
 * Blank page → website → CRM → knowledge → calendar → bookings → invoices →
 * voice → marketing → reports → everything keeps improving.
 * The website is one surface of the operating system, not the product.
 */

const SURFACES: Array<{ label: string; tag: string }> = [
  { label: 'website', tag: 'your public face, generated' },
  { label: 'crm', tag: 'every customer, remembered' },
  { label: 'knowledge', tag: 'answers you never repeat' },
  { label: 'calendar', tag: 'your week, protected' },
  { label: 'bookings', tag: 'enquiry to confirmed' },
  { label: 'invoices', tag: 'work to paid' },
  { label: 'voice', tag: 'it starts talking' },
  { label: 'marketing', tag: 'it starts publishing' },
  { label: 'reports', tag: 'it shows its working' },
];

function SurfaceTile({ surface, index }: { surface: (typeof SURFACES)[number]; index: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 26, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: 0.16 * index, duration: 0.75, ease: EASE }}
      style={{
        border: `1px solid ${palette.hairline}`,
        background: palette.paper,
        borderRadius: 14,
        padding: '18px 20px',
        boxShadow: '0 14px 34px rgba(24, 28, 38, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span
          aria-hidden
          style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1, translate: '0 -2px' }}
        >
          ●
        </span>
        <span
          style={{
            fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            fontSize: 21,
            color: palette.ink,
          }}
        >
          {surface.label}
        </span>
      </div>
      <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.5, color: palette.bodyGrey }}>
        {surface.tag}
      </p>
    </motion.div>
  );
}

/** The Layer-3 taste — one morning improvement, one yes. */
function MorningTaste() {
  const reduced = useReducedMotion();
  const [approved, setApproved] = React.useState(false);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: 0.16 * SURFACES.length + 0.2, duration: 0.85, ease: EASE }}
      style={{
        marginTop: 18,
        border: `1px solid ${approved ? palette.accentGold : palette.hairline}`,
        background: palette.paperDeep,
        borderRadius: 16,
        padding: '22px 24px',
        transition: 'border-color 0.5s ease',
      }}
    >
      <MicroLabel>and then, every morning</MicroLabel>
      <p
        style={{
          margin: '12px 0 0',
          fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          fontSize: 22,
          lineHeight: 1.45,
          color: palette.ink,
          maxWidth: 560,
        }}
      >
        Mōrena. Yesterday: 5 enquiries, 2 bookings, +$680. Your slowest page converts 17% worse
        than the rest — I&apos;ve rebuilt it.
      </p>
      {!approved ? (
        <button
          type="button"
          onClick={() => setApproved(true)}
          className={styles.ctaPrimary}
          style={{ marginTop: 18, border: 'none', cursor: 'pointer' }}
        >
          approve
          <span aria-hidden style={{ color: palette.goldSoft, fontSize: 15, lineHeight: 1 }}>
            ✓
          </span>
        </button>
      ) : (
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ margin: '18px 0 0', fontSize: 14, color: palette.ink }}
        >
          <span style={{ color: palette.accentGold, fontWeight: 600 }}>✓ live.</span> Website, FAQ,
          agent answers, and email drafts all updated — the whole site reads one source of truth.
        </motion.p>
      )}
    </motion.div>
  );
}

export function LivingSiteEvolution() {
  const reduced = useReducedMotion();

  return (
    <section id="living-site" className={styles.section} style={{ background: palette.paperDeep }}>
      <div className={styles.inner}>
        <div className={styles.sectionHead}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
              •
            </span>
            <MicroLabel as="h2">the living site</MicroLabel>
          </div>
          <p className={styles.h2} style={{ marginTop: 16 }}>
            install a business, not software
            <span aria-hidden style={{ color: palette.accentGold }}>
              .
            </span>
          </p>
          <p className={styles.sectionLede}>
            Choose an industry. Answer ten questions. A whole operating system assembles itself —
            nobody bolts plugins together, and the website is just one surface of it.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 14,
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          }}
        >
          {SURFACES.map((s, i) => (
            <SurfaceTile key={s.label} surface={s} index={i} />
          ))}
        </div>

        <MorningTaste />

        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1.2 }}
          style={{
            marginTop: 26,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 13,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: palette.bodyGrey,
          }}
        >
          <motion.span
            aria-hidden
            animate={reduced ? undefined : { opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ color: palette.accentGold, fontSize: 12 }}
          >
            ●
          </motion.span>
          everything keeps improving
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 1 }}
          style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}
        >
          <Link href="/living-site" className={styles.sectionLink} style={{ marginTop: 30 }}>
            step inside a living site
            <span aria-hidden style={{ color: palette.accentGold }}>
              →
            </span>
          </Link>
          <Link href="/install" className={styles.sectionLink} style={{ marginTop: 30 }}>
            run the installer
            <span aria-hidden style={{ color: palette.accentGold }}>
              →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
