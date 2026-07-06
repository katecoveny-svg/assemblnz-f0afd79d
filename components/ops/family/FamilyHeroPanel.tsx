'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useFormStatus } from 'react-dom';
import { SAMPLE_NEWSLETTER } from '@/lib/family/sample';
import { parseNewsletterAction, loadSampleAction, clearAllProposedAction } from '@/app/customers/family/ops/actions';

/**
 * FamilyHeroPanel — the stunning top of Family OS: the warm luminous WebGL
 * hero behind the "Life admin, handled." title and the newsletter input.
 * The parse form posts the real server action (Claude reads the newsletter);
 * the submit button shows a live "reading your newsletter…" pending state.
 */

const FamilyHero = dynamic(() => import('@/components/ops/family/FamilyHero'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: 'radial-gradient(120% 90% at 60% 25%, #fff, #FBF6EE 70%)' }} />,
});

const CREAM = '#FBF6EE';
const INK = '#2A2620';
const MUTED = '#8A8272';
const GOLD = '#BFA37A';
const CORAL = '#E08A6B';

function ParseButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} style={{
      fontSize: 14.5, fontWeight: 600, padding: '12px 24px', borderRadius: 999, cursor: pending ? 'wait' : 'pointer',
      color: '#fff', border: 'none', background: `linear-gradient(180deg, #e79a82, ${CORAL})`,
      boxShadow: `0 8px 22px ${CORAL}55, inset 0 1px 0 rgba(255,255,255,0.4)`, opacity: pending ? 0.85 : 1,
    }}>
      {pending ? '✨ Reading your newsletter…' : '✨ Turn this into our week'}
    </button>
  );
}

function MiniButton({ action, label, tone }: { action: () => Promise<void>; label: string; tone: string }) {
  const { pending } = useFormStatus();
  return (
    <form action={action}>
      <button type="submit" disabled={pending} style={{ fontSize: 12.5, fontWeight: 600, color: tone, background: 'transparent', border: `1.5px solid ${tone}`, borderRadius: 999, padding: '9px 16px', cursor: 'pointer' }}>{label}</button>
    </form>
  );
}

export function FamilyHeroPanel({ parsed }: { parsed: boolean }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => setAnimate(!window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);

  return (
    <div style={{
      position: 'relative', overflow: 'hidden', borderRadius: 22,
      border: `1px solid ${GOLD}55`, boxShadow: '0 16px 44px rgba(154,123,58,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
      minHeight: 460,
    }}>
      <div style={{ position: 'absolute', inset: 0 }}><FamilyHero animate={animate} /></div>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${CREAM}f4 0%, ${CREAM}cc 46%, transparent 74%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', padding: 'clamp(24px,3.5vw,40px)', maxWidth: 620 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: CORAL }}>family os · concept</p>
        <h1 style={{ fontFamily: 'var(--font-brand-display)', fontSize: 'clamp(2.1rem,4.4vw,3.3rem)', fontWeight: 600, color: INK, margin: '8px 0 0', lineHeight: 1.04 }}>
          Life admin, handled<span style={{ color: CORAL }}>.</span>
        </h1>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#5b5548', margin: '12px 0 0', maxWidth: 500 }}>
          Forward your school newsletter and I&rsquo;ll turn it into the family&rsquo;s week — events, pickups,
          what to buy, what to sign, what to pay. I <strong>draft and suggest</strong>; you approve.
        </p>

        <form action={parseNewsletterAction} style={{ marginTop: 18 }}>
          <textarea name="newsletter" defaultValue={parsed ? '' : SAMPLE_NEWSLETTER} placeholder="Paste or forward a school newsletter…" rows={4}
            style={{ width: '100%', boxSizing: 'border-box', borderRadius: 14, border: `1px solid ${GOLD}66`, background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(6px)', padding: '12px 14px', fontSize: 13, lineHeight: 1.5, color: INK, resize: 'vertical', fontFamily: 'var(--font-brand-body)' }} />
          <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <ParseButton />
            {parsed
              ? <MiniButton action={clearAllProposedAction} label="Clear" tone={MUTED} />
              : <MiniButton action={loadSampleAction} label="Use the sample" tone={GOLD} />}
            <span style={{ fontSize: 11.5, color: MUTED }}>real agent · claude reads it · drag the orbs</span>
          </div>
        </form>
      </div>
    </div>
  );
}
