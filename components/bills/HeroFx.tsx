'use client';

import { motion } from 'framer-motion';
import { Wallet, TrendingDown, Zap, Wifi, Shield, Tv } from 'lucide-react';
import { CountUp } from './motion';

/** Gradient-glow wordmark — the assembl POP move, teal-led for Bills. */
export function WordMark({ size = 20 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="flex items-center justify-center rounded-xl"
        style={{
          width: size * 1.7,
          height: size * 1.7,
          background: 'linear-gradient(135deg, #5AADA0, #3A7D6E)',
          boxShadow: '0 0 14px rgba(90,173,160,0.6), 0 0 40px rgba(90,173,160,0.3)',
        }}
      >
        <Wallet size={size} color="#fff" />
      </span>
      <span
        className="font-extrabold uppercase"
        style={{
          fontFamily: 'var(--font-bills-display)',
          fontSize: size * 0.95,
          letterSpacing: '0.02em',
          background: 'linear-gradient(90deg, #FFFFFF 0%, #EEF2F8 40%, #5AADA0 78%, #3A7D6E 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 16px rgba(90,173,160,0.45))',
        }}
      >
        Assembl&nbsp;Bills
      </span>
    </span>
  );
}

const CHIPS = [
  { Icon: Zap, label: 'Power', v: '−$71/mo', tone: 'teal' as const, x: '-8%', y: '2%', d: 0 },
  { Icon: Wifi, label: 'Broadband', v: '−$20/mo', tone: 'teal' as const, x: '72%', y: '-6%', d: 0.4 },
  { Icon: Shield, label: 'Insurance', v: '−$32/mo', tone: 'teal' as const, x: '78%', y: '62%', d: 0.8 },
  { Icon: Tv, label: 'Sky Sport', v: '+$40/mo', tone: 'coral' as const, x: '-10%', y: '66%', d: 1.2 },
];

/** The glowing hero card: a big count-up of total found, with provider chips
 *  floating around it. */
export function HeroSavingsCard({ found }: { found: number }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm">
      {/* central glow disc */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: '78%', height: '78%', background: 'radial-gradient(circle, rgba(90,173,160,0.22), transparent 68%)' }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* core panel — visible by default; no framer gate on visibility */}
      <div
        className="absolute left-1/2 top-1/2 flex aspect-square w-[62%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center"
        style={{
          background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.10), rgba(255,255,255,0.02))',
          border: '1px solid var(--b-teal-line)',
          boxShadow: 'inset 0 0 40px rgba(90,173,160,0.14), 0 0 60px -10px rgba(90,173,160,0.45)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--b-teal)' }}>
          <TrendingDown size={13} /> found / yr
        </span>
        <CountUp
          to={found}
          prefix="$"
          className="mt-1 text-4xl font-extrabold sm:text-5xl"
          style={{ fontFamily: 'var(--font-bills-display)', color: 'var(--b-ink)', letterSpacing: '-0.02em' }}
        />
        <span className="mt-1 text-[11px]" style={{ color: 'var(--b-faint)' }}>across power, broadband, subs…</span>
      </div>

      {/* floating provider chips — visible by default; framer only floats them */}
      {CHIPS.map((c, i) => (
        <motion.div
          key={c.label}
          className="absolute inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold"
          style={{
            left: c.x,
            top: c.y,
            background: 'rgba(17,22,35,0.85)',
            border: `1px solid ${c.tone === 'teal' ? 'var(--b-teal-line)' : 'var(--b-coral-line)'}`,
            color: c.tone === 'teal' ? 'var(--b-teal)' : 'var(--b-coral)',
            boxShadow: c.tone === 'teal' ? 'var(--b-glow-teal)' : 'var(--b-glow-coral)',
            backdropFilter: 'blur(6px)',
          }}
          animate={{ y: [0, -8, 0] }}
          transition={{ y: { duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: c.d } }}
        >
          <c.Icon size={13} /> {c.label} <span style={{ color: 'var(--b-ink)' }}>{c.v}</span>
        </motion.div>
      ))}
    </div>
  );
}

/** Scrolling marquee of the NZ providers Assembl Bills knows. */
export function ProviderMarquee() {
  const names = [
    'Mercury', 'Contact', 'Genesis', 'Meridian', 'Electric Kiwi', 'Frank', 'Spark', 'One NZ', '2degrees',
    'AMI', 'Tower', 'State', 'AA Insurance', 'Netflix', 'Sky Sport', 'Spotify', 'Adobe', 'Auckland Council',
  ];
  const row = [...names, ...names];
  return (
    <div className="relative overflow-hidden py-2" style={{ maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' }}>
      <div className="flex w-max animate-[bills-marquee_38s_linear_infinite] gap-3">
        {row.map((n, i) => (
          <span
            key={`${n}-${i}`}
            className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--b-line)', color: 'var(--b-muted)' }}
          >
            {n}
          </span>
        ))}
      </div>
      <style>{`@keyframes bills-marquee { from { transform: translateX(0);} to { transform: translateX(-50%);} }`}</style>
    </div>
  );
}
