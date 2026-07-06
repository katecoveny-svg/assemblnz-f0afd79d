'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, animate as fmAnimate } from 'framer-motion';
import { MoanaChat } from '@/components/ops/moana/MoanaChat';

/**
 * MoanaDashboard — the luminous "glass + gold + pāua" reference dashboard.
 *
 * A real WebGL ethereal hero (EtherHero: glass ribbons, gold sparkle
 * constellation, a stylised NZ snapper, pāua shimmer) over a warm-pearl glass
 * bento grid — framer-motion physics throughout. Features Jack's wharf
 * (Mangawhai estuary) as the personal, local hook, the LIVE Tide & Weather
 * chat, and sample sea/tide/catch cards — every figure tagged SAMPLE with the
 * official-source link, so nothing fabricates live conditions.
 */

const EtherHero = dynamic(() => import('@/components/ops/moana/EtherHero'), {
  ssr: false,
  loading: () => <HeroFallback />,
});

// Luminous NZ-marine palette.
const PEARL = '#F5F1E8';
const INK = '#2A2620';
const MUTED = '#8A8272';
const GOLD = '#BFA37A';
const GOLD_DEEP = '#9A7B3A';
const CORAL = '#C97B63';
const PAUA = '#2E7D74';

function HeroFallback() {
  return <div style={{ width: '100%', height: '100%', background: `radial-gradient(120% 90% at 50% 30%, #fff, ${PEARL} 70%)` }} />;
}

const glass = (): React.CSSProperties => ({
  borderRadius: 20,
  border: `1px solid ${GOLD}55`,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.86), rgba(255,255,255,0.62))',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 16px 44px rgba(154,123,58,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
});

const eyebrow: React.CSSProperties = { fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED };
const tag = (label: string, color = GOLD_DEEP) => (
  <span style={{ ...eyebrow, fontSize: 9.5, color, letterSpacing: '0.14em' }}>{label}</span>
);
const Source = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: PAUA, textDecoration: 'none' }}>
    {children} ↗
  </a>
);

function CountUp({ to, decimals = 0, animate }: { to: number; decimals?: number; animate: boolean }) {
  const [val, setVal] = useState(animate ? 0 : to);
  useEffect(() => {
    if (!animate) return setVal(to);
    const c = fmAnimate(0, to, { duration: 1.1, ease: 'easeOut', onUpdate: setVal });
    return () => c.stop();
  }, [to, animate]);
  return <>{val.toFixed(decimals)}</>;
}

function MagneticButton({ children, onClick, animate }: { children: React.ReactNode; onClick?: () => void; animate: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 14 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 14 });
  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      style={{
        x, y, padding: '12px 22px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
        color: '#fff', background: `linear-gradient(180deg, #d98a72, ${CORAL})`,
        boxShadow: `0 8px 22px ${CORAL}55, inset 0 1px 0 rgba(255,255,255,0.4)`,
      }}
      onMouseMove={(e) => {
        if (!animate || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.35);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.4);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.button>
  );
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const rise = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 120, damping: 18 } } };

function Cell({ children, style, animate, span }: { children: React.ReactNode; style?: React.CSSProperties; animate: boolean; span?: string }) {
  return (
    <motion.div
      variants={rise}
      whileHover={animate ? { y: -4, boxShadow: '0 24px 56px rgba(154,123,58,0.18), inset 0 1px 0 rgba(255,255,255,0.8)' } : undefined}
      style={{ ...glass(), padding: 20, gridColumn: span, ...style }}
    >
      {children}
    </motion.div>
  );
}

export function MoanaDashboard() {
  const [animate, setAnimate] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => setAnimate(!window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);
  const toChat = () => chatRef.current?.scrollIntoView({ behavior: animate ? 'smooth' : 'auto', block: 'center' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, color: INK }}>
      {/* ── ethereal 3D hero ────────────────────────────────────────── */}
      <div style={{ ...glass(), position: 'relative', overflow: 'hidden', height: 400, padding: 0 }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <EtherHero animate={animate} />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${PEARL}f0 0%, ${PEARL}88 40%, transparent 68%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 clamp(24px,4vw,52px)', maxWidth: 600, pointerEvents: 'none' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p style={{ ...eyebrow, color: GOLD_DEEP }}>moana · your boating &amp; fishing companion</p>
            <h1 style={{ fontFamily: 'var(--font-brand-display)', fontSize: 'clamp(2.2rem,4.4vw,3.4rem)', fontWeight: 600, color: INK, margin: '10px 0 0', lineHeight: 1.05 }}>
              The sea, read for you<span style={{ color: CORAL }}>.</span>
            </h1>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#5b5548', margin: '14px 0 0', maxWidth: 430 }}>
              Two live assembl agents — Tide &amp; Weather and Catch Log — read the forecast, the
              tides and the rules, answer with their sources, and never fabricate live conditions.
            </p>
            <div style={{ marginTop: 20, pointerEvents: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
              <MagneticButton onClick={toChat} animate={animate}>Ask Moana →</MagneticButton>
              <span style={{ fontSize: 11, color: MUTED }}>drag the sea · concept demo</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Jack's wharf — the personal, local hook ─────────────────── */}
      <motion.div variants={rise} initial="hidden" animate="show" style={{ ...glass(), border: `1px solid ${CORAL}77`, padding: 22 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 260px' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
              <p style={{ ...eyebrow, color: CORAL }}>jack&rsquo;s fishing · land-based</p>
              {tag('ON FOOT / SCOOTER', CORAL)}
            </div>
            <h2 style={{ fontFamily: 'var(--font-brand-display)', fontSize: 22, fontWeight: 600, color: INK, margin: '8px 0 0' }}>
              Where are you fishing today?
            </h2>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#5b5548', margin: '8px 0 0', maxWidth: 460 }}>
              Wharf, rock and beach — no boat needed. Ask what&rsquo;s on right now for your area, the gear worth
              throwing, and the tide to work. Real tide, real rules, and it never sugar-coats rock-fishing safety.
            </p>
            <div style={{ marginTop: 14, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <MagneticButton onClick={toChat} animate={animate}>Ask what&rsquo;s on today →</MagneticButton>
              <Link href="/customers/moana/ops/jack" style={{ fontSize: 13, color: CORAL, textDecoration: 'none', fontWeight: 600 }}>
                open Jack&rsquo;s spots →
              </Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: '1 1 260px' }}>
            {[
              { k: 'Mangawhai', v: 'wharf · beach · heads', s: 'soft baits, kahawai run-out' },
              { k: 'Bay of Islands', v: 'Russell · Tapeka Pt', s: 'land-based kingi for the keen' },
              { k: 'Auckland front', v: 'Okahu → Devonport', s: 'snapper on soft plastics' },
              { k: 'Gear now', v: 'soft baits · sabikis', s: 'micro-jigs · stickbaits' },
            ].map((c) => (
              <div key={c.k} style={{ borderRadius: 14, border: `1px solid ${GOLD}44`, background: 'rgba(255,255,255,0.55)', padding: '10px 12px' }}>
                <div style={{ ...eyebrow, fontSize: 9 }}>{c.k}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: INK, marginTop: 3 }}>{c.v}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{c.s}</div>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 11, color: MUTED, margin: '14px 0 0' }}>
          Sample local guidance — check the real tide on <Source href="https://www.linz.govt.nz/sea/tides">LINZ</Source>,
          limits on <Source href="https://www.fisheries.govt.nz/travel-and-recreation/fishing/fishing-rules/">MPI&rsquo;s NZ Fishing Rules</Source>, and respect rāhui &amp; the estuary.
        </p>
      </motion.div>

      {/* ── Bento grid ──────────────────────────────────────────────── */}
      <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <Cell animate={animate} span="span 2" style={{ padding: 0, overflow: 'hidden' }}>
          <div ref={chatRef}><MoanaChat /></div>
        </Cell>

        <Cell animate={animate}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <p style={eyebrow}>sea snapshot</p>{tag('SAMPLE')}
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
            {[{ label: 'wind kt', to: 12, d: 0 }, { label: 'swell m', to: 0.8, d: 1 }, { label: 'gust kt', to: 18, d: 0 }].map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-brand-display)', fontSize: 30, fontWeight: 600, color: INK }}><CountUp to={s.to} decimals={s.d} animate={animate} /></div>
                <div style={{ ...eyebrow, fontSize: 9.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: MUTED, margin: '14px 0 0' }}>SSW, good visibility. <Source href="https://www.metservice.com/marine">MetService Marine</Source></p>
        </Cell>

        <Cell animate={animate}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <p style={eyebrow}>tide window</p>{tag('SAMPLE')}
          </div>
          <svg viewBox="0 0 200 60" style={{ width: '100%', height: 56, marginTop: 12 }}>
            <path d="M0,45 C30,45 40,12 70,12 C100,12 110,48 140,48 C170,48 180,18 200,18" fill="none" stroke={PAUA} strokeWidth="2.5" />
            <circle cx="70" cy="12" r="3.5" fill={GOLD} /><circle cx="140" cy="48" r="3.5" fill={CORAL} />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: INK, marginTop: 6 }}>
            <span>high 1:12p · 2.9m</span><span>low 7:20p · 0.5m</span>
          </div>
          <p style={{ fontSize: 11, color: MUTED, margin: '10px 0 0' }}><Source href="https://www.linz.govt.nz/sea/tides">LINZ tide predictions</Source></p>
        </Cell>

        <Cell animate={animate}>
          <p style={eyebrow}>before you go</p>
          <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Lifejackets for everyone', 'Two waterproof forms of comms', 'Log a trip report (Coastguard)', 'Fuel + weather checked'].map((s) => (
              <li key={s} style={{ display: 'flex', gap: 9, alignItems: 'center', fontSize: 12.5, color: INK }}>
                <span style={{ width: 15, height: 15, borderRadius: 5, background: PAUA, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10 }}>✓</span>{s}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: 11, color: MUTED, margin: '12px 0 0' }}><Source href="https://www.maritimenz.govt.nz/recreational">Boating Safety Code</Source></p>
        </Cell>

        <Cell animate={animate}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <p style={eyebrow}>catch log</p>{tag('SAMPLE')}
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[{ f: 'Snapper', n: '38 cm · released' }, { f: 'Kahawai', n: '2 kept' }, { f: 'Parore', n: 'off the wharf' }].map((c) => (
              <div key={c.f} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: INK, borderBottom: `1px solid ${GOLD}33`, paddingBottom: 6 }}>
                <span>{c.f}</span><span style={{ color: MUTED }}>{c.n}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: MUTED, margin: '12px 0 0' }}>Limits vary &amp; change — <Source href="https://www.fisheries.govt.nz/travel-and-recreation/fishing/fishing-rules/">check MPI</Source>. Respect rāhui.</p>
        </Cell>

        {/* Kids lessons teaser → dedicated motion-lessons page */}
        <Cell animate={animate} style={{ border: `1px solid ${CORAL}66`, display: 'flex', flexDirection: 'column' }}>
          <p style={eyebrow}>kids lessons</p>
          <div style={{ fontFamily: 'var(--font-brand-display)', fontSize: 20, fontWeight: 600, color: INK, marginTop: 8 }}>
            Learn to fish — the fun way.
          </div>
          <p style={{ fontSize: 12.5, color: '#5b5548', marginTop: 6, flex: 1 }}>
            Short animated lessons for tamariki: bait a hook, cast safe, tie a hook, and let a fish go gently.
          </p>
          <Link href="/customers/moana/ops/lessons" style={{ fontSize: 13, color: CORAL, textDecoration: 'none', marginTop: 10, fontWeight: 600 }}>
            Watch the lessons →
          </Link>
        </Cell>
      </motion.div>

      <p style={{ fontSize: 11, color: MUTED, textAlign: 'center', margin: '4px 0 0' }}>
        Concept demo · not a real product or customer · sample figures. For real decisions on the water,
        check the official source and use your own judgement.
      </p>
    </div>
  );
}
