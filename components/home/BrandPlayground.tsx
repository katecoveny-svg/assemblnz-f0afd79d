'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PLAYGROUND } from '@/lib/copy/homepage';
import { composeAd, loadCampaignImage, type ComposableCampaign } from '@/components/ad-studio/compose';

const PatternStudio = dynamic(() => import('@/components/pattern-studio/AssemblPatternStudioComponent'), {
  ssr: false,
});

type Dna = {
  url: string;
  name: string;
  descriptor: string;
  tagline: string;
  accent: string;
  ink: string;
  bg: string;
  facts: Array<{ label: string; value: string }>;
  source: 'muse' | 'meta';
};

const INK = '#313c42';
const MUTED = '#68766f';
const HAIRLINE = 'rgba(49, 60, 66, 0.12)';

/** SessionStorage key the Ad Studio picks the read brand up from. */
export const BRAND_DNA_KEY = 'assembl-brand-dna';

/**
 * The homepage Pattern Studio moment: the same engine that draws this site's
 * imagery, live and interactive — and pointed at the visitor's own website.
 * Read the brand and the particles re-form as their name in their colour;
 * from there, one step into the Ad Studio (brand pre-loaded) or the Pattern
 * Studio itself.
 */
export function BrandPlayground() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [dna, setDna] = useState<Dna | null>(null);
  const [reading, setReading] = useState(false);
  const [note, setNote] = useState('');
  const [making, setMaking] = useState(false);
  const [ads, setAds] = useState<Array<{ label: string; w: number; h: number; dataUrl: string }>>([]);

  const readSite = async () => {
    if (reading || !url.trim()) return;
    setReading(true);
    setNote('');
    try {
      const r = await fetch('/api/creative/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const d = await r.json();
      if (d.error || d.notConfigured) {
        setNote(d.error ?? `This needs ${d.envVar} set.`);
        return;
      }
      setDna(d.dna as Dna);
    } catch (e) {
      setNote((e as Error).message);
    } finally {
      setReading(false);
    }
  };

  const toAdStudio = () => {
    if (!dna) return;
    try {
      window.sessionStorage.setItem(BRAND_DNA_KEY, JSON.stringify(dna));
    } catch {
      /* storage unavailable — the studio just starts empty */
    }
    router.push('/ad-studio');
  };

  // Make the ads right here — same campaign engine as the Ad Studio.
  const makeAds = async () => {
    if (!dna || making) return;
    setMaking(true);
    setNote('');
    setAds([]);
    try {
      const r = await fetch('/api/creative/ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dna, goal: '' }),
      });
      const d = await r.json();
      if (d.error || d.notConfigured) {
        setNote(d.error ?? `This needs ${d.envVar} set.`);
        return;
      }
      const c = d.campaign as ComposableCampaign;
      const img = await loadCampaignImage(c.image);
      if (document.fonts?.ready) await document.fonts.ready;
      setAds([
        { label: 'Square 1:1', w: 1080, h: 1080, dataUrl: composeAd(img, 1080, 1080, c) },
        { label: 'Landscape 16:9', w: 1920, h: 1080, dataUrl: composeAd(img, 1920, 1080, c) },
      ]);
    } catch (e) {
      setNote((e as Error).message);
    } finally {
      setMaking(false);
    }
  };

  return (
    <section
      aria-labelledby="brand-playground-title"
      style={{
        position: 'relative',
        overflow: 'hidden',
        margin: 'clamp(48px, 8vw, 110px) auto 0',
        width: 'min(1180px, calc(100% - 36px))',
        minHeight: 560,
        borderRadius: 30,
        border: `1px solid ${HAIRLINE}`,
        background: '#fff',
        fontFamily: 'var(--font-body), Inter, system-ui, sans-serif',
      }}
    >
      {/* The live engine — interactive; re-forms as the visitor's brand. */}
      <div style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <PatternStudio
          mode={dna ? 'particleText' : 'particles'}
          words={dna ? [dna.name] : ['assembl']}
          count={dna ? 320 : 150}
          connectLines={!dna}
          connectDistance={130}
          glow
          speed={0.8}
          turbulence={20}
          mouseInteractive
          backgroundColor="#ffffff"
          foregroundColor={dna ? dna.accent : '#3f7373'}
          accentColor={dna ? dna.accent : '#b8964f'}
          lazyMount
        />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          maxWidth: 560,
          padding: 'clamp(28px, 5vw, 56px)',
          pointerEvents: 'none',
        }}
      >
        <p style={{ margin: 0, color: '#8b7447', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          {PLAYGROUND.eyebrow}
        </p>
        <h2
          id="brand-playground-title"
          style={{
            margin: 0,
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 'clamp(32px, 4.6vw, 54px)',
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            color: INK,
          }}
        >
          {PLAYGROUND.heading}
        </h2>
        <p style={{ margin: 0, maxWidth: 460, color: MUTED, fontSize: 15, lineHeight: 1.6 }}>
          {PLAYGROUND.body}
        </p>

        <div style={{ display: 'flex', gap: 8, maxWidth: 460, pointerEvents: 'auto' }}>
          <input
            type="url"
            value={url}
            placeholder={PLAYGROUND.urlPlaceholder}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') readSite();
            }}
            aria-label={PLAYGROUND.urlLabel}
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: 12,
              border: `1px solid ${HAIRLINE}`,
              background: 'rgba(255,255,255,0.92)',
              color: INK,
              fontSize: 15,
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={readSite}
            disabled={reading || !url.trim()}
            style={{
              padding: '12px 20px',
              borderRadius: 12,
              border: 'none',
              background: INK,
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: reading || !url.trim() ? 'default' : 'pointer',
              opacity: reading || !url.trim() ? 0.6 : 1,
            }}
          >
            {reading ? PLAYGROUND.readingAction : PLAYGROUND.readAction}
          </button>
        </div>

        {note && (
          <p style={{ margin: 0, color: '#8a4b3c', fontSize: 13, pointerEvents: 'auto' }} aria-live="polite">
            {note}
          </p>
        )}

        {dna && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, pointerEvents: 'auto' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 999,
                border: `1px solid ${HAIRLINE}`,
                background: 'rgba(255,255,255,0.92)',
                color: INK,
                fontSize: 13,
              }}
            >
              <span aria-hidden style={{ width: 12, height: 12, borderRadius: '50%', background: dna.accent }} />
              {dna.name}
            </span>
            <button
              type="button"
              onClick={makeAds}
              disabled={making}
              style={{
                padding: '12px 20px',
                borderRadius: 999,
                border: 'none',
                background: dna.accent,
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: making ? 'default' : 'pointer',
                opacity: making ? 0.7 : 1,
              }}
            >
              {making ? PLAYGROUND.makingAdsAction : PLAYGROUND.adsAction}
            </button>
            <button
              type="button"
              onClick={toAdStudio}
              style={{
                padding: '12px 20px',
                borderRadius: 999,
                border: `1px solid ${HAIRLINE}`,
                background: 'rgba(255,255,255,0.92)',
                color: INK,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {PLAYGROUND.openStudioAction}
            </button>
            <Link href="/pattern-studio" style={{ color: INK, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              {PLAYGROUND.patternsAction} →
            </Link>
          </div>
        )}

        {ads.length > 0 && dna && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, pointerEvents: 'auto' }}>
            {ads.map((card) => (
              <figure key={card.label} style={{ margin: 0, width: card.w > card.h ? 300 : 220 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.dataUrl}
                  alt={`${dna.name} ad — ${card.label}`}
                  style={{ width: '100%', borderRadius: 12, display: 'block', border: `1px solid ${HAIRLINE}` }}
                />
                <figcaption
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 6 }}
                >
                  <span style={{ fontSize: 11, color: MUTED }}>{card.label}</span>
                  <a
                    href={card.dataUrl}
                    download={`assembl-ad-${card.w}x${card.h}.png`}
                    style={{ color: dna.accent, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
                  >
                    Download
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
