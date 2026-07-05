'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, animate as fmAnimate } from 'framer-motion';
import { MoanaChat } from '@/components/ops/moana/MoanaChat';

/**
 * MoanaDashboard — the reference glass-bento command screen.
 *
 * Real WebGL 3D hero (SeaHero, R3F), framer-motion physics (staggered reveal,
 * hover levitation, roll-up counters, a magnetic CTA), over a glass bento grid
 * with the LIVE Tide & Weather chat as one cell. Every figure is sample data,
 * clearly tagged, with the honest "check the official source" link — nothing
 * here fabricates live conditions. prefers-reduced-motion freezes all of it.
 */

const SeaHero = dynamic(() => import('@/components/ops/moana/SeaHero'), {
  ssr: false,
  loading: () => <SeaFallback />,
});

// Moana sea palette (mirrors lib/brand/configs/moana.ts).
const NAVY = '#0A2A43';
const TEAL = '#1E7A8C';
const SAND = '#F2EFE6';
const STEEL = '#6E93A6';
const ORANGE = '#E1622F';
const GOLD = '#BFA37A';

function SeaFallback() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: `radial-gradient(120% 80% at 70% 20%, ${TEAL}55, ${NAVY} 70%)`,
      }}
    />
  );
}

const glass = (blur = 12): React.CSSProperties => ({
  borderRadius: 20,
  border: `1px solid ${GOLD}44`,
  background: `linear-gradient(180deg, ${SAND}1f, ${SAND}0a)`,
  backdropFilter: `blur(${blur}px)`,
  WebkitBackdropFilter: `blur(${blur}px)`,
  boxShadow: '0 14px 40px rgba(10,42,67,0.28), inset 0 1px 0 rgba(255,255,255,0.14)',
});

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: STEEL,
};

/** Roll-up number. */
function CountUp({ to, suffix = '', decimals = 0, animate }: { to: number; suffix?: string; decimals?: number; animate: boolean }) {
  const [val, setVal] = useState(animate ? 0 : to);
  useEffect(() => {
    if (!animate) {
      setVal(to);
      return;
    }
    const controls = fmAnimate(0, to, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [to, animate]);
  return (
    <span>
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/** Magnetic glass button — leans toward the cursor, springs back. */
function MagneticButton({
  children,
  onClick,
  animate,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  animate: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 14 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 14 });
  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      style={{
        x,
        y,
        padding: '12px 22px',
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 600,
        color: '#fff',
        background: `linear-gradient(180deg, ${ORANGE}, #c8531f)`,
        boxShadow: `0 8px 24px ${ORANGE}66, inset 0 1px 0 rgba(255,255,255,0.35)`,
      }}
      onMouseMove={(e) => {
        if (!animate || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.35);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.4);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.button>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 120, damping: 18 } },
};

function Cell({ children, style, animate, span }: { children: React.ReactNode; style?: React.CSSProperties; animate: boolean; span?: string }) {
  return (
    <motion.div
      variants={rise}
      whileHover={animate ? { y: -4, boxShadow: '0 22px 54px rgba(10,42,67,0.34), inset 0 1px 0 rgba(255,255,255,0.18)' } : undefined}
      style={{ ...glass(), padding: 20, gridColumn: span, ...style }}
    >
      {children}
    </motion.div>
  );
}

const tag = (label: string) => (
  <span style={{ ...eyebrow, fontSize: 9.5, color: GOLD, letterSpacing: '0.14em' }}>{label}</span>
);

const Source = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: TEAL, textDecoration: 'none' }}>
    {children} ↗
  </a>
);

export function MoanaDashboard() {
  const [animate, setAnimate] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setAnimate(!m.matches);
  }, []);

  const scrollToChat = () => chatRef.current?.scrollIntoView({ behavior: animate ? 'smooth' : 'auto', block: 'center' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ── 3D hero ─────────────────────────────────────────────────── */}
      <div style={{ ...glass(6), position: 'relative', overflow: 'hidden', height: 380, padding: 0 }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <SeaHero animate={animate} />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, ${NAVY}dd 0%, ${NAVY}77 42%, transparent 72%)`,
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 clamp(24px,4vw,52px)', maxWidth: 620, pointerEvents: 'none' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p style={{ ...eyebrow, color: SAND, opacity: 0.7 }}>moana · your boating &amp; fishing companion</p>
            <h1 style={{ fontFamily: 'var(--font-brand-display)', fontSize: 'clamp(2.2rem,4.4vw,3.4rem)', fontWeight: 600, color: SAND, margin: '10px 0 0', lineHeight: 1.05 }}>
              The sea, read for you<span style={{ color: GOLD }}>.</span>
            </h1>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#dce6ec', margin: '14px 0 0', maxWidth: 440 }}>
              Two live assembl agents — Tide &amp; Weather and Catch Log — read the forecast, the
              tides and the rules, answer with their sources, and never fabricate live conditions.
            </p>
            <div style={{ marginTop: 20, pointerEvents: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
              <MagneticButton onClick={scrollToChat} animate={animate}>
                Ask Moana →
              </MagneticButton>
              <span style={{ fontSize: 11, color: SAND, opacity: 0.6 }}>drag the sea ·  concept demo</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Bento grid ──────────────────────────────────────────────── */}
      {/* Reveal on MOUNT (animate), never on scroll — content below the fold
          on mobile must never stay invisible if an observer doesn't fire. */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}
      >
        {/* Live chat — the real agent, spanning two columns where there's room */}
        <Cell animate={animate} span="span 2" style={{ padding: 0, overflow: 'hidden' }}>
          <div ref={chatRef}>
            <MoanaChat />
          </div>
        </Cell>

        {/* Sea snapshot — sample, honest */}
        <Cell animate={animate}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <p style={eyebrow}>sea snapshot</p>
            {tag('SAMPLE')}
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
            {[
              { label: 'wind kt', to: 12, d: 0 },
              { label: 'swell m', to: 0.8, d: 1 },
              { label: 'gust kt', to: 18, d: 0 },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-brand-display)', fontSize: 30, fontWeight: 600, color: SAND }}>
                  <CountUp to={s.to} decimals={s.d} animate={animate} />
                </div>
                <div style={{ ...eyebrow, fontSize: 9.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: STEEL, margin: '14px 0 0' }}>
            SSW, good visibility. <Source href="https://www.metservice.com/marine">MetService Marine</Source>
          </p>
        </Cell>

        {/* Tide window — mini SVG curve */}
        <Cell animate={animate}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <p style={eyebrow}>tide window</p>
            {tag('SAMPLE')}
          </div>
          <svg viewBox="0 0 200 60" style={{ width: '100%', height: 56, marginTop: 12 }}>
            <path d="M0,45 C30,45 40,12 70,12 C100,12 110,48 140,48 C170,48 180,18 200,18" fill="none" stroke={TEAL} strokeWidth="2.5" />
            <circle cx="70" cy="12" r="3.5" fill={GOLD} />
            <circle cx="140" cy="48" r="3.5" fill={STEEL} />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: SAND, marginTop: 6 }}>
            <span>high 9:42a · 3.1m</span>
            <span>low 3:58p · 0.4m</span>
          </div>
          <p style={{ fontSize: 11, color: STEEL, margin: '10px 0 0' }}>
            <Source href="https://www.linz.govt.nz/sea/tides">LINZ tide predictions</Source>
          </p>
        </Cell>

        {/* Best window */}
        <Cell animate={animate} style={{ border: `1px solid ${GOLD}` }}>
          <p style={eyebrow}>best window today</p>
          <div style={{ fontFamily: 'var(--font-brand-display)', fontSize: 26, fontWeight: 600, color: SAND, marginTop: 10 }}>
            9:40 – 12:10
          </div>
          <p style={{ fontSize: 12.5, color: STEEL, marginTop: 6 }}>
            Light wind, outgoing tide. Check the live forecast before you commit — conditions change.
          </p>
          {tag('SAMPLE · YOUR CALL')}
        </Cell>

        {/* Safety check */}
        <Cell animate={animate}>
          <p style={eyebrow}>before you go</p>
          <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Lifejackets for everyone', 'Two waterproof forms of comms', 'Log a trip report (Coastguard)', 'Fuel + weather checked'].map((s) => (
              <li key={s} style={{ display: 'flex', gap: 9, alignItems: 'center', fontSize: 12.5, color: SAND }}>
                <span style={{ width: 15, height: 15, borderRadius: 5, background: `${TEAL}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10 }}>✓</span>
                {s}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: 11, color: STEEL, margin: '12px 0 0' }}>
            <Source href="https://www.maritimenz.govt.nz/recreational">Boating Safety Code</Source>
          </p>
        </Cell>

        {/* Catch log */}
        <Cell animate={animate}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <p style={eyebrow}>catch log</p>
            {tag('SAMPLE')}
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { fish: 'Snapper', note: '38 cm · released' },
              { fish: 'Kahawai', note: '2 kept' },
              { fish: 'Gurnard', note: '1 kept' },
            ].map((c) => (
              <div key={c.fish} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: SAND, borderBottom: `1px solid ${GOLD}22`, paddingBottom: 6 }}>
                <span>{c.fish}</span>
                <span style={{ color: STEEL }}>{c.note}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: STEEL, margin: '12px 0 0' }}>
            Limits vary by area and change — <Source href="https://www.fisheries.govt.nz/travel-and-recreation/fishing/fishing-rules/">check MPI&rsquo;s NZ Fishing Rules</Source>. Respect rāhui &amp; marine reserves.
          </p>
        </Cell>
      </motion.div>

      <p style={{ fontSize: 11, color: STEEL, textAlign: 'center', margin: '4px 0 0' }}>
        Concept demo · not a real product or customer · sample figures. For real decisions on the water,
        check the official source and use your own judgement.
      </p>
    </div>
  );
}
